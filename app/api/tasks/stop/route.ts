import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await prisma.task.updateMany({
    where: { status: "InProgress" },
    data: { status: "ToDo" },
  })

  return NextResponse.json({ stopped: result.count })
}
