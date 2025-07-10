"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, AlertCircle, Users } from "lucide-react"
import type { Kullanici } from "@/types/kullanici"

export default function KullaniciYonetimi() {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKullanici, setEditingKullanici] = useState<Kullanici | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    kullaniciAdi: "",
    sifre: "",
    rol: "user" as "admin" | "user",
  })

  useEffect(() => {
    loadKullanicilar()
  }, [])

  const loadKullanicilar = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/kullanicilar")
      if (response.ok) {
        const data = await response.json()
        setKullanicilar(data)
      } else {
        setError("Kullanıcılar yüklenirken hata oluştu")
      }
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error)
      setError("Kullanıcılar yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.kullaniciAdi || !formData.sifre) {
      setError("Kullanıcı adı ve şifre gereklidir")
      return
    }

    try {
      const url = editingKullanici ? `/api/kullanicilar/${editingKullanici.id}` : "/api/kullanicilar"
      const method = editingKullanici ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (editingKullanici) {
          setKullanicilar((prev) => prev.map((k) => (k.id === editingKullanici.id ? data : k)))
        } else {
          setKullanicilar((prev) => [data, ...prev])
        }
        handleCloseDialog()
      } else {
        setError(data.error || "İşlem sırasında hata oluştu")
      }
    } catch (error) {
      console.error("Kullanıcı işlemi hatası:", error)
      setError("İşlem sırasında hata oluştu")
    }
  }

  const handleEdit = (kullanici: Kullanici) => {
    setEditingKullanici(kullanici)
    setFormData({
      kullaniciAdi: kullanici.kullaniciAdi,
      sifre: "",
      rol: kullanici.rol,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return
    }

    try {
      const response = await fetch(`/api/kullanicilar/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setKullanicilar((prev) => prev.filter((k) => k.id !== id))
      } else {
        const data = await response.json()
        setError(data.error || "Kullanıcı silinirken hata oluştu")
      }
    } catch (error) {
      console.error("Kullanıcı silme hatası:", error)
      setError("Kullanıcı silinirken hata oluştu")
    }
  }

  const handleStatusToggle = async (kullanici: Kullanici) => {
    try {
      const response = await fetch(`/api/kullanicilar/${kullanici.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aktif: !kullanici.aktif }),
      })

      if (response.ok) {
        const updatedKullanici = await response.json()
        setKullanicilar((prev) => prev.map((k) => (k.id === kullanici.id ? updatedKullanici : k)))
      } else {
        const data = await response.json()
        setError(data.error || "Durum güncellenirken hata oluştu")
      }
    } catch (error) {
      console.error("Durum güncelleme hatası:", error)
      setError("Durum güncellenirken hata oluştu")
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingKullanici(null)
    setFormData({
      kullaniciAdi: "",
      sifre: "",
      rol: "user",
    })
    setError("")
  }

  const getRolBadgeVariant = (rol: string) => {
    return rol === "admin" ? "default" : "secondary"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Kullanıcılar yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingKullanici(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kullanıcı
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingKullanici ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}</DialogTitle>
              <DialogDescription>
                {editingKullanici ? "Kullanıcı bilgilerini güncelleyin" : "Yeni kullanıcı bilgilerini girin"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kullaniciAdi">Kullanıcı Adı</Label>
                <Input
                  id="kullaniciAdi"
                  value={formData.kullaniciAdi}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kullaniciAdi: e.target.value }))}
                  placeholder="Kullanıcı adını girin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sifre">Şifre {editingKullanici && "(Değiştirmek için yeni şifre girin)"}</Label>
                <Input
                  id="sifre"
                  type="password"
                  value={formData.sifre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sifre: e.target.value }))}
                  placeholder={editingKullanici ? "Yeni şifre (opsiyonel)" : "Şifre girin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value: "admin" | "user") => setFormData((prev) => ({ ...prev, rol: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingKullanici ? "Güncelle" : "Ekle"}</Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  İptal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({kullanicilar.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturma Tarihi</TableHead>
                  <TableHead>Son Güncelleme</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kullanicilar.map((kullanici) => (
                  <TableRow key={kullanici.id}>
                    <TableCell className="font-medium">{kullanici.kullaniciAdi}</TableCell>
                    <TableCell>
                      <Badge variant={getRolBadgeVariant(kullanici.rol)}>
                        {kullanici.rol === "admin" ? "Admin" : "Kullanıcı"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={kullanici.aktif} onCheckedChange={() => handleStatusToggle(kullanici)} />
                        <span className={kullanici.aktif ? "text-green-600" : "text-red-600"}>
                          {kullanici.aktif ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{kullanici.olusturmaTarihi}</TableCell>
                    <TableCell>{kullanici.guncellemeTarihi}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(kullanici)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(kullanici.id)}
                          disabled={kullanici.kullaniciAdi === "Admin"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {kullanicilar.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Henüz kullanıcı bulunmuyor.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
