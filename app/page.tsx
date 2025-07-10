"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TalepForm from "@/components/talep-form"
import TalepTable from "@/components/talep-table"
import Dashboard from "@/components/dashboard"
import LoginForm from "@/components/login-form"
import AppHeader from "@/components/app-header"
import KullaniciYonetimi from "@/components/kullanici-yonetimi"
import type { Talep } from "@/types/talep"
import type { AuthUser } from "@/types/kullanici"
import { saveAuthUser, getAuthUser, removeAuthUser } from "@/lib/auth"

type AppView = "main" | "user-management"

export default function TalepTakipSistemi() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [currentView, setCurrentView] = useState<AppView>("main")
  const [talepler, setTalepler] = useState<Talep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde oturum kontrolü yap
    const savedUser = getAuthUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  // Talepleri veritabanından yükle
  const loadTalepler = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/talepler")
      if (response.ok) {
        const data = await response.json()
        setTalepler(data)
      } else {
        console.error("Talepler yüklenirken hata oluştu")
      }
    } catch (error) {
      console.error("Talepler yüklenirken hata:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && currentView === "main") {
      loadTalepler()
    }
  }, [user, currentView])

  const handleLogin = (authUser: AuthUser) => {
    setUser(authUser)
    saveAuthUser(authUser)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView("main")
    removeAuthUser()
  }

  const handleUserManagement = () => {
    setCurrentView("user-management")
  }

  const handleBackToMain = () => {
    setCurrentView("main")
  }

  const handleTalepEkle = async (yeniTalep: Omit<Talep, "id" | "guncellemeTarihi">) => {
    try {
      const response = await fetch("/api/talepler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(yeniTalep),
      })

      if (response.ok) {
        const eklenenTalep = await response.json()
        setTalepler((prev) => [eklenenTalep, ...prev])
        alert("Talep başarıyla kaydedildi!")
      } else {
        console.error("Talep eklenirken hata oluştu")
        alert("Talep eklenirken hata oluştu")
      }
    } catch (error) {
      console.error("Talep eklenirken hata:", error)
      alert("Talep eklenirken hata oluştu")
    }
  }

  const handleTalepGuncelle = async (id: string, guncelTalep: Partial<Talep>) => {
    try {
      const response = await fetch(`/api/talepler/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guncelTalep),
      })

      if (response.ok) {
        const guncellenenTalep = await response.json()
        setTalepler((prev) => prev.map((talep) => (talep.id === id ? guncellenenTalep : talep)))
      } else {
        console.error("Talep güncellenirken hata oluştu")
        alert("Talep güncellenirken hata oluştu")
      }
    } catch (error) {
      console.error("Talep güncellenirken hata:", error)
      alert("Talep güncellenirken hata oluştu")
    }
  }

  const handleTalepSil = async (id: string) => {
    try {
      const response = await fetch(`/api/talepler/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTalepler((prev) => prev.filter((talep) => talep.id !== id))
      } else {
        console.error("Talep silinirken hata oluştu")
        alert("Talep silinirken hata oluştu")
      }
    } catch (error) {
      console.error("Talep silinirken hata:", error)
      alert("Talep silinirken hata oluştu")
    }
  }

  const handleTalepleriYukle = async (yeniTalepler: Talep[]) => {
    try {
      // Sadece yeni talepleri (id'si olmayan) ekle
      const eklenecekTalepler = yeniTalepler
        .filter((talep) => !talep.id || talep.id.startsWith("imported_"))
        .map((talep) => {
          const { id, guncellemeTarihi, ...talepData } = talep
          return talepData
        })

      if (eklenecekTalepler.length === 0) {
        return
      }

      const response = await fetch("/api/talepler/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ talepler: eklenecekTalepler }),
      })

      if (response.ok) {
        const eklenenTalepler = await response.json()
        setTalepler((prev) => [...eklenenTalepler, ...prev])
      } else {
        console.error("Talepler yüklenirken hata oluştu")
        alert("Talepler yüklenirken hata oluştu")
      }
    } catch (error) {
      console.error("Talepler yüklenirken hata:", error)
      alert("Talepler yüklenirken hata oluştu")
    }
  }

  // Giriş yapılmamışsa login formu göster
  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  // Kullanıcı yönetimi ekranı
  if (currentView === "user-management") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} onLogout={handleLogout} onUserManagement={handleBackToMain} />
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="mb-4">
            <button onClick={handleBackToMain} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ← Ana Sayfaya Dön
            </button>
          </div>
          <KullaniciYonetimi />
        </div>
      </div>
    )
  }

  // Ana uygulama ekranı
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} onLogout={handleLogout} onUserManagement={handleUserManagement} />
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Talepler yükleniyor...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader user={user} onLogout={handleLogout} onUserManagement={handleUserManagement} />
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <p className="text-muted-foreground text-center">Talep girişi, takibi ve yönetimi için kapsamlı sistem</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="form">Talep Girişi</TabsTrigger>
            <TabsTrigger value="table">Talep Takibi</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>İstatistikler ve KPI Takibi</CardTitle>
                <CardDescription>Talep verilerinizin detaylı analizi ve görselleştirmesi</CardDescription>
              </CardHeader>
              <CardContent>
                <Dashboard talepler={talepler} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Talep Girişi</CardTitle>
                <CardDescription>Aşağıdaki formu doldurarak yeni bir talep oluşturun</CardDescription>
              </CardHeader>
              <CardContent>
                <TalepForm onSubmit={handleTalepEkle} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Talep Takip Tablosu</CardTitle>
                <CardDescription>Mevcut talepleri görüntüleyin, düzenleyin ve yönetin</CardDescription>
              </CardHeader>
              <CardContent>
                <TalepTable
                  talepler={talepler}
                  onTalepGuncelle={handleTalepGuncelle}
                  onTalepSil={handleTalepSil}
                  onTalepleriYukle={handleTalepleriYukle}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
