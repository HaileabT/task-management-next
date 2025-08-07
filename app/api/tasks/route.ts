import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "../../../lib/validation";
import { $Enums, Prisma } from "@/generated/prisma";

export async function GET(req: NextRequest) {
  try {
    type StatusType = $Enums.TaskStatus;
    const validTaskStatus: StatusType[] | string[] = [
      "PENDING",
      "DONE",
      "FAILED",
      "IN_PROGRESS",
    ];

    const { searchParams } = new URL(req.url);

    const userId = req.headers.get("x-user-id") || "";
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 },
      );
    }

    const take = parseInt(searchParams.get("take") || "10", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const orderBy = searchParams.get("orderBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const title = searchParams.get("title");

    const where: Prisma.tasksWhereInput = {};
    if (title) where.title = { contains: title, mode: "insensitive" };
    where.userId = userId;
    if (category)
      where.categories = {
        some: {
          category: {
            name: category,
          },
        },
      };

    if (status && validTaskStatus.includes(status as any))
      where.status = status as StatusType;

    const tasks = await prisma.tasks.findMany({
      where,
      take,
      skip,
      orderBy: { [orderBy]: order },
      select: {
        id: true,
        title: true,
        description: true,
        user: { select: { id: true, email: true } },
        categories: {
          select: {
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: error },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validationResult = createTaskSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { title, description, categories } = validationResult.data;

    const userId = req.headers.get("x-user-id") || "";
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 },
      );
    }
    let categoryCreateOrConnect: Prisma.categoriesOnTasksCreateWithoutTaskInput[] =
      [];
    if (categories && categories.length > 0) {
      categories.forEach(async (category) => {
        categoryCreateOrConnect.push({
          category: {
            connectOrCreate: {
              where: { name: category },
              create: { name: category },
            },
          },
        });
      });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "User is not known." },
        { status: 404 },
      );
    }
    const task = await prisma.tasks.create({
      data: {
        title,
        description: description ?? "",
        user: {
          connect: {
            id: userId,
          },
        },
        categories: {
          create: categoryCreateOrConnect,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        user: { select: { id: true, email: true, username: true } },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create task", details: error },
      { status: 500 },
    );
  }
}
