import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    where: { status: "ToDo" },
  })

  if (tasks.length === 0) {
    return NextResponse.json({ message: "Нет задач ToDo" })
  }

  const webhookUrl = process.env.FLASK_WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: "FLASK_WEBHOOK_URL not configured" }, { status: 500 })
  }

  for (const task of tasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "InProgress" },
    })

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          task_id: task.id,
          source_url: task.sourceArchiveUrl,
          rewrite_count: task.rewriteCount,
          callback_url: `${process.env.NEXTAUTH_URL}/api/progress/${task.id}`,
        }),
      })
    } catch (error) {
      console.error(`Failed to start task ${task.id}:`, error)
    }
  }

  return NextResponse.json({ started: tasks.length })
}
