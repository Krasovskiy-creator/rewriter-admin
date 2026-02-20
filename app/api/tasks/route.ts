import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  
  const task = await prisma.task.create({
    data: {
      sourceArchiveUrl: body.sourceArchiveUrl,
      rewriteCount: body.rewriteCount || 100,
      fileName: body.fileName,
    },
  })

  return NextResponse.json(task)
}
