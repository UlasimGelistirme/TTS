"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Talep } from "@/types/talep"

interface TalepEditDialogProps {
  talep: Talep | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, guncelTalep: Partial<Talep>) => void
}

interface UpdateLog {
  id: number
  degisenAlan: string
  eskiDeger: string
  yeniDeger: string
  guncellemeTarihi: string
}

const IZMIR_ILCELERI = [
  "Aliağa",
  "Balçova",
  "Bayındır",
  "Bayraklı",
  "Bergama",
  "Beydağ",
  "Bornova",
  "Buca",
  "Çeşme",
  "Çiğli",
  "Dikili",
  "Foça",
  "Gaziemir",
  "Güzelbahçe",
  "Karabağlar",
  "Karaburun",
  "Karşıyaka",
  "Kemalpaşa",
  "Kınık",
  "Kiraz",
  "Konak",
  "Menderes",
  "Menemen",
  "Narlıdere",
  "Ödemiş",
  "Seferihisar",
  "Selçuk",
  "Tire",
  "Torbalı",
  "Urla",
]

const IC_PAYDAS_SECENEKLERI = ["Otobüs İşletme Dairesi Başkanlığı", "Ulaşım Planlama Dairesi Başkanlığı"]
const DIS_PAYDAS_SECENEKLERI = ["İlçe Belediyesi", "Muhtarlık", "Meclis Üyesi", "İzulaş", "Diğer"]

const ALAN_ISIMLERI: Record<string, string> = {
  talepSahibi: "Talep Sahibi",
  talepSahibiAciklamasi: "Talep Sahibi Açıklaması",
  talepSahibiDigerAciklama: "Diğer Açıklama",
  talepIlcesi: "Talep İlçesi",
  bolge: "Bölge",
  hatNo: "Hat No",
  isletici: "İşletici",
  talepOzeti: "Talep Özeti",
  talepIletimSekli: "Talep İletim Şekli",
  evrakTarihi: "Evrak Tarihi",
  evrakSayisi: "Evrak Sayısı",
  yapılanIs: "Yapılan İş",
  talepDurumu: "Talep Durumu",
}

export default function TalepEditDialog({ talep, open, onOpenChange, onSave }: TalepEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Talep>>({})
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (talep) {
      setFormData(talep)
      loadUpdateLogs(talep.id)
    }
  }, [talep])

  const loadUpdateLogs = async (talepId: string) => {
    try {
      const response = await fetch(`/api/talepler/${talepId}/logs`)
      if (response.ok) {
        const logs = await response.json()
        setUpdateLogs(logs)
      }
    } catch (error) {
      console.error("Güncelleme logları yüklenirken hata:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!talep) return

    setLoading(true)
    try {
      await onSave(talep.id, formData)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!talep) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Talep Düzenle</DialogTitle>
          <DialogDescription>Talep bilgilerini güncelleyin</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Form Alanı */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[60vh]">
              <form onSubmit={handleSubmit} className="space-y-4 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Talep Sahibi */}
                  <div className="space-y-2">
                    <Label>Talep Sahibi</Label>
                    <Select
                      value={formData.talepSahibi || ""}
                      onValueChange={(value) => {
                        handleInputChange("talepSahibi", value)
                        handleInputChange("talepSahibiAciklamasi", "")
                        handleInputChange("talepSahibiDigerAciklama", "")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="İç Paydaş">İç Paydaş</SelectItem>
                        <SelectItem value="Dış Paydaş">Dış Paydaş</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Talep Sahibi Açıklaması */}
                  {formData.talepSahibi && (
                    <div className="space-y-2">
                      <Label>Talep Sahibi Açıklaması</Label>
                      <Select
                        value={formData.talepSahibiAciklamasi || ""}
                        onValueChange={(value) => {
                          handleInputChange("talepSahibiAciklamasi", value)
                          if (value !== "Diğer") {
                            handleInputChange("talepSahibiDigerAciklama", "")
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.talepSahibi === "İç Paydaş"
                            ? IC_PAYDAS_SECENEKLERI.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))
                            : DIS_PAYDAS_SECENEKLERI.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Diğer Açıklama */}
                  {formData.talepSahibi === "Dış Paydaş" && formData.talepSahibiAciklamasi === "Diğer" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Diğer Açıklama</Label>
                      <Input
                        value={formData.talepSahibiDigerAciklama || ""}
                        onChange={(e) => handleInputChange("talepSahibiDigerAciklama", e.target.value)}
                      />
                    </div>
                  )}

                  {/* Talep İlçesi */}
                  <div className="space-y-2">
                    <Label>Talep İlçesi</Label>
                    <Select
                      value={formData.talepIlcesi || ""}
                      onValueChange={(value) => handleInputChange("talepIlcesi", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IZMIR_ILCELERI.map((ilce) => (
                          <SelectItem key={ilce} value={ilce}>
                            {ilce}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bölge */}
                  <div className="space-y-2">
                    <Label>Bölge</Label>
                    <Select value={formData.bolge || ""} onValueChange={(value) => handleInputChange("bolge", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((bolge) => (
                          <SelectItem key={bolge} value={bolge.toString()}>
                            {bolge}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hat No */}
                  <div className="space-y-2">
                    <Label>Hat No</Label>
                    <Input value={formData.hatNo || ""} onChange={(e) => handleInputChange("hatNo", e.target.value)} />
                  </div>

                  {/* İşletici */}
                  <div className="space-y-2">
                    <Label>İşletici</Label>
                    <Select
                      value={formData.isletici || ""}
                      onValueChange={(value) => handleInputChange("isletici", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Eshot">Eshot</SelectItem>
                        <SelectItem value="İzTaşıt">İzTaşıt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Talep İletim Şekli */}
                  <div className="space-y-2">
                    <Label>Talep İletim Şekli</Label>
                    <Select
                      value={formData.talepIletimSekli || ""}
                      onValueChange={(value) => {
                        handleInputChange("talepIletimSekli", value)
                        if (value !== "Elektronik Belge Yönetim Sistemi (EBYS)") {
                          handleInputChange("evrakTarihi", "")
                          handleInputChange("evrakSayisi", "")
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Şifahi">Şifahi</SelectItem>
                        <SelectItem value="Toplantı">Toplantı</SelectItem>
                        <SelectItem value="E-posta">E-posta</SelectItem>
                        <SelectItem value="Elektronik Belge Yönetim Sistemi (EBYS)">
                          Elektronik Belge Yönetim Sistemi (EBYS)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Talep Durumu */}
                  <div className="space-y-2">
                    <Label>Talep Durumu</Label>
                    <Select
                      value={formData.talepDurumu || ""}
                      onValueChange={(value) => handleInputChange("talepDurumu", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="İletildi">İletildi</SelectItem>
                        <SelectItem value="Değerlendirilecek">Değerlendirilecek</SelectItem>
                        <SelectItem value="Olumlu">Olumlu</SelectItem>
                        <SelectItem value="Olumsuz">Olumsuz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* EBYS Bilgileri */}
                {formData.talepIletimSekli === "Elektronik Belge Yönetim Sistemi (EBYS)" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">EBYS Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Evrak Tarihi</Label>
                          <Input
                            type="date"
                            value={formData.evrakTarihi || ""}
                            onChange={(e) => handleInputChange("evrakTarihi", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Evrak Sayısı</Label>
                          <Input
                            value={formData.evrakSayisi || ""}
                            onChange={(e) => handleInputChange("evrakSayisi", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Talep Özeti */}
                <div className="space-y-2">
                  <Label>Talep Özeti</Label>
                  <Textarea
                    value={formData.talepOzeti || ""}
                    onChange={(e) => handleInputChange("talepOzeti", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Yapılan İş */}
                <div className="space-y-2">
                  <Label>Talebe İlişkin Yapılan İş</Label>
                  <Textarea
                    value={formData.yapılanIs || ""}
                    onChange={(e) => handleInputChange("yapılanIs", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    İptal
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </div>

          {/* Güncelleme Logları */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Güncelleme Logları</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[50vh]">
                  {updateLogs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Henüz güncelleme yapılmamış.</p>
                  ) : (
                    <div className="space-y-3">
                      {updateLogs.map((log) => (
                        <div key={log.id} className="border-l-2 border-blue-200 pl-3 pb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {ALAN_ISIMLERI[log.degisenAlan] || log.degisenAlan}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{log.guncellemeTarihi}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="text-red-600">
                              <span className="font-medium">Eski:</span> {log.eskiDeger || "Boş"}
                            </div>
                            <div className="text-green-600">
                              <span className="font-medium">Yeni:</span> {log.yeniDeger || "Boş"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
