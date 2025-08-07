import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const where: any = {};
    if (id) where.id = { contains: id, mode: "insensitive" };

    const task = await prisma.tasks.findUnique({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 5,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task", details: error }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();

    let { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const validationResult = updateTaskSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { title, description, categories } = validationResult.data;

    let categoryCreateOrConnect: Prisma.CategoriesOnTasksCreateWithoutTaskInput[] = [];
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

    const userId = req.headers.get("x-user-id") || "";
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oldTask = await prisma.tasks.findUnique({ where: { id } });
    if (!oldTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
    if (userId !== oldTask.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await prisma.categoriesOnTasks.deleteMany({
      where: {
        taskId: id,
      },
    });

    const post = await prisma.tasks.update({
      where: { id },
      data: {
        title,
        description,
        userId: userId,
        categories: {
          create: categoryCreateOrConnect,
        },
      },
      include: {
        categories: {
          select: {
            category: true,
          },
        },
        user: {
          omit: {
            password: true,
          },
        },
      },
    });
    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task", details: error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const userId = req.headers.get("x-user-id") || "";
    if (!userId) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }
    const oldTask = await prisma.tasks.findUnique({ where: { id } });
    if (!oldTask) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
    if (userId !== oldTask.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await prisma.tasks.delete({ where: { id } });
    return NextResponse.json({ status: "successful" }, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task", details: error }, { status: 500 });
  }
}
