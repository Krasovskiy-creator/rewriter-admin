"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Неверный логин или пароль")
      setLoading(false)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">🔐 Rewriter Admin</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите логин"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  )
}
