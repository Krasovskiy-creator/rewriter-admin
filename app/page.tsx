"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Square, BarChart3, Plus, RefreshCw, LogOut, Trash2, ExternalLink } from "lucide-react"

interface Task {
  id: number
  status: string
  sourceArchiveUrl: string | null
  resultArchiveUrl: string | null
  rewriteCount: number
  progress: string
  progressCurrent: number
  progressTotal: number
  fileName: string | null
  createdAt: string
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTaskUrl, setNewTaskUrl] = useState("")
  const [newTaskCount, setNewTaskCount] = useState(100)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    try {
      await fetch("/api/tasks/start", { method: "POST" })
      fetchTasks()
    } catch (error) {
      console.error("Error starting tasks:", error)
    }
  }

  const handleStop = async () => {
    try {
      await fetch("/api/tasks/stop", { method: "POST" })
      fetchTasks()
    } catch (error) {
      console.error("Error stopping tasks:", error)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskUrl) return
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceArchiveUrl: newTaskUrl,
          rewriteCount: newTaskCount,
        }),
      })
      setShowAddModal(false)
      setNewTaskUrl("")
      setNewTaskCount(100)
      fetchTasks()
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Удалить задачу?")) return
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      fetchTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleUpdateCount = async (id: number, count: number) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewriteCount: count }),
      })
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ToDo": return "bg-yellow-100 text-yellow-800"
      case "InProgress": return "bg-blue-100 text-blue-800"
      case "Done": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">📝 Rewriter Admin</h1>
            <div className="flex gap-2">
              <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" /> Старт
              </Button>
              <Button onClick={handleStop} variant="destructive">
                <Square className="w-4 h-4 mr-2" /> Стоп
              </Button>
              <Button onClick={() => setShowAddModal(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Добавить
              </Button>
              <Button onClick={fetchTasks} variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={() => signOut()} variant="ghost">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Архив текстов</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Архив рерайтов</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Кол-во</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Прогресс</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{task.id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.sourceArchiveUrl ? (
                      <a href={task.sourceArchiveUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {task.fileName || 'Скачать'}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.resultArchiveUrl ? (
                      <a href={task.resultArchiveUrl} target="_blank" rel="noopener noreferrer"
                         className="text-green-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Скачать
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={task.rewriteCount}
                      onChange={(e) => handleUpdateCount(task.id, parseInt(e.target.value))}
                      className="w-20 h-8 text-sm"
                      disabled={task.status !== 'ToDo'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-48">
                      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${task.progressTotal > 0 ? (task.progressCurrent / task.progressTotal) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {task.progress || `${task.progressCurrent}/${task.progressTotal}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Нет задач. Нажмите "Добавить" чтобы создать.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Добавить задачу</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ссылка на архив</label>
                  <Input
                    value={newTaskUrl}
                    onChange={(e) => setNewTaskUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Количество рерайтов</label>
                  <Input
                    type="number"
                    value={newTaskCount}
                    onChange={(e) => setNewTaskCount(parseInt(e.target.value))}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddTask}>
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
