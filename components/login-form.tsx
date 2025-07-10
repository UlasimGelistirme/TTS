"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn } from "lucide-react"
import type { LoginData, AuthUser } from "@/types/kullanici"

interface LoginFormProps {
  onLogin: (user: AuthUser) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({
    kullaniciAdi: "",
    sifre: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.kullaniciAdi || !formData.sifre) {
      setError("Kullanıcı adı ve şifre gereklidir")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onLogin(data.user)
      } else {
        setError(data.error || "Giriş yapılırken hata oluştu")
      }
    } catch (error) {
      console.error("Giriş hatası:", error)
      setError("Giriş yapılırken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Talep Takip Sistemi</CardTitle>
          <CardDescription>Sisteme giriş yapmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kullaniciAdi">Kullanıcı Adı</Label>
              <Input
                id="kullaniciAdi"
                type="text"
                value={formData.kullaniciAdi}
                onChange={(e) => handleInputChange("kullaniciAdi", e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sifre">Şifre</Label>
              <Input
                id="sifre"
                type="password"
                value={formData.sifre}
                onChange={(e) => handleInputChange("sifre", e.target.value)}
                placeholder="Şifrenizi girin"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Giriş yapılıyor..."
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Giriş Yap
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">Demo Giriş Bilgileri:</h3>
            <p className="text-sm text-blue-700">
              <strong>Kullanıcı Adı:</strong> Admin
              <br />
              <strong>Şifre:</strong> Admin2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
