"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import saveAs from "file-saver"

interface RaporDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface RaporData {
  yeniTalepler: any[]
  durumDegisiklikleri: any[]
  toplamYeni: number
  toplamDurumDegisikligi: number
}

export default function RaporDialog({ open, onOpenChange }: RaporDialogProps) {
  const [baslangicTarihi, setBaslangicTarihi] = useState("")
  const [bitisTarihi, setBitisTarihi] = useState("")
  const [loading, setLoading] = useState(false)
  const [raporData, setRaporData] = useState<RaporData | null>(null)

  const handleRaporOlustur = async () => {
    if (!baslangicTarihi || !bitisTarihi) {
      alert("Lütfen başlangıç ve bitiş tarihlerini seçin")
      return
    }

    if (new Date(baslangicTarihi) > new Date(bitisTarihi)) {
      alert("Başlangıç tarihi bitiş tarihinden büyük olamaz")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/talepler/rapor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslangicTarihi, bitisTarihi }),
      })

      const contentType = response.headers.get("content-type") || ""

      // Success branch – expecting JSON
      if (response.ok && contentType.includes("application/json")) {
        const data: RaporData = await response.json()
        setRaporData(data)
        return
      }

      // Error branches
      const errorMessage = contentType.includes("application/json")
        ? (await response.json())?.error || "Bilinmeyen sunucu hatası"
        : await response.text() // HTML or plain-text fallback

      console.error("Rapor oluşturulurken hata:", errorMessage)
      alert("Rapor oluşturulurken hata oluştu:\n" + errorMessage)
    } catch (error) {
      console.error("Rapor oluşturulurken hata:", error)
      alert("Rapor oluşturulurken ağ hatası meydana geldi.")
    } finally {
      setLoading(false)
    }
  }

  const handleExcelIndir = () => {
    if (!raporData) return

    const wb = XLSX.utils.book_new()

    // Yeni Talepler sayfası
    if (raporData.yeniTalepler.length > 0) {
      const yeniTaleplerData = raporData.yeniTalepler.map((talep) => ({
        Kategori: talep.kategori,
        "Talep Sahibi": talep.talepSahibi,
        "Talep Sahibi Açıklaması": talep.talepSahibiAciklamasi,
        "Diğer Açıklama": talep.talepSahibiDigerAciklama || "",
        "Talep İlçesi": talep.talepIlcesi,
        Bölge: talep.bolge,
        "Hat No": talep.hatNo,
        İşletici: talep.isletici,
        "Talep Özeti": talep.talepOzeti,
        "Talep İletim Şekli": talep.talepIletimSekli,
        "Evrak Tarihi": talep.evrakTarihi || "",
        "Evrak Sayısı": talep.evrakSayisi || "",
        "Yapılan İş": talep.yapılanIs,
        "Talep Durumu": talep.talepDurumu,
        "Oluşturma Tarihi": talep.olusturmaTarihi,
        "Güncelleme Tarihi": talep.guncellemeTarihi,
      }))

      const ws1 = XLSX.utils.json_to_sheet(yeniTaleplerData)
      XLSX.utils.book_append_sheet(wb, ws1, "Yeni Talepler")
    }

    // Durum Değişiklikleri sayfası
    if (raporData.durumDegisiklikleri.length > 0) {
      const durumDegisiklikleriData = raporData.durumDegisiklikleri.map((talep) => ({
        Kategori: talep.kategori,
        "Talep Sahibi": talep.talepSahibi,
        "Talep Sahibi Açıklaması": talep.talepSahibiAciklamasi,
        "Diğer Açıklama": talep.talepSahibiDigerAciklama || "",
        "Talep İlçesi": talep.talepIlcesi,
        Bölge: talep.bolge,
        "Hat No": talep.hatNo,
        İşletici: talep.isletici,
        "Talep Özeti": talep.talepOzeti,
        "Talep İletim Şekli": talep.talepIletimSekli,
        "Evrak Tarihi": talep.evrakTarihi || "",
        "Evrak Sayısı": talep.evrakSayisi || "",
        "Yapılan İş": talep.yapılanIs,
        "Mevcut Durum": talep.talepDurumu,
        "Eski Durum": talep.eskiDurum,
        "Yeni Durum": talep.yeniDurum,
        "Durum Değişiklik Tarihi": talep.durumDegisiklikTarihi,
        "Oluşturma Tarihi": talep.olusturmaTarihi,
        "Güncelleme Tarihi": talep.guncellemeTarihi,
      }))

      const ws2 = XLSX.utils.json_to_sheet(durumDegisiklikleriData)
      XLSX.utils.book_append_sheet(wb, ws2, "Durum Değişiklikleri")
    }

    // Özet sayfası
    const ozetData = [
      { Kategori: "Yeni Talepler", Adet: raporData.toplamYeni },
      { Kategori: "Durum Değişiklikleri", Adet: raporData.toplamDurumDegisikligi },
      { Kategori: "Toplam", Adet: raporData.toplamYeni + raporData.toplamDurumDegisikligi },
    ]

    const ws3 = XLSX.utils.json_to_sheet(ozetData)
    XLSX.utils.book_append_sheet(wb, ws3, "Özet")

    const tarihAraligi = `${baslangicTarihi}_${bitisTarihi}`

    // !!!  Node/Deno dosya API’si yerine tarayıcı-uyumlu indirme !!!
    const wbArray: ArrayBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    })

    const blob = new Blob([wbArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    })

    saveAs(blob, `talep_raporu_${tarihAraligi}.xlsx`)
  }

  const handleClose = () => {
    setRaporData(null)
    setBaslangicTarihi("")
    setBitisTarihi("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rapor Al</DialogTitle>
          <DialogDescription>
            Belirtilen tarih aralığındaki yeni talepler ve durum değişikliklerini raporlayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tarih Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baslangic">Başlangıç Tarihi</Label>
              <Input
                id="baslangic"
                type="date"
                value={baslangicTarihi}
                onChange={(e) => setBaslangicTarihi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bitis">Bitiş Tarihi</Label>
              <Input id="bitis" type="date" value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} />
            </div>
          </div>

          {/* Rapor Oluştur Butonu */}
          <Button onClick={handleRaporOlustur} disabled={loading} className="w-full">
            {loading ? "Rapor Oluşturuluyor..." : "Rapor Oluştur"}
          </Button>

          {/* Rapor Sonuçları */}
          {raporData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yeni Talepler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{raporData.toplamYeni}</div>
                    <p className="text-sm text-muted-foreground">adet yeni talep</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Durum Değişiklikleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{raporData.toplamDurumDegisikligi}</div>
                    <p className="text-sm text-muted-foreground">adet durum değişikliği</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Toplam</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {raporData.toplamYeni + raporData.toplamDurumDegisikligi}
                  </div>
                  <p className="text-sm text-muted-foreground">toplam işlem</p>
                </CardContent>
              </Card>

              <Button onClick={handleExcelIndir} className="w-full flex items-center gap-2">
                <Download className="w-4 h-4" />
                Excel Olarak İndir
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
