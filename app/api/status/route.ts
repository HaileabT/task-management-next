import { $Enums } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

type StatusType = $Enums.TaskStatus;
const validTaskStatus: StatusType[] | string[] = [
  "PENDING",
  "DONE",
  "FAILED",
  "IN_PROGRESS",
];

export const GET = (request: NextRequest) => {
  return NextResponse.json(validTaskStatus, { status: 200 });
};
