import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await request.json()
  const taskId = parseInt(params.taskId)

  const { current, total, status, resultUrl } = body

  let progressText = ""
  if (status === "working") {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0
    const filled = Math.floor(pct / 5)
    const bar = "▓".repeat(filled) + "░".repeat(20 - filled)
    progressText = `${bar} ${pct}% (${current}/${total})`
  } else if (status === "packing") {
    progressText = "▓".repeat(20) + " 100% — упаковка..."
  } else if (status === "uploading") {
    progressText = "▓".repeat(20) + " 100% — загрузка..."
  } else if (status === "done") {
    progressText = "▓".repeat(20) + " ✅ Готово!"
  }

  const updateData: any = {
    progress: progressText,
    progressCurrent: current || 0,
    progressTotal: total || 0,
  }

  if (status === "done") {
    updateData.status = "Done"
  }

  if (resultUrl) {
    updateData.resultArchiveUrl = resultUrl
  }

  await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  })

  return NextResponse.json({ success: true })
}
