"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Download, Upload, Trash2, Edit, Eye, EyeOff } from "lucide-react"
import type { Talep } from "@/types/talep"
import * as XLSX from "xlsx"
import TalepEditDialog from "@/components/talep-edit-dialog"
import RaporDialog from "@/components/rapor-dialog"

interface TalepTableProps {
  talepler: Talep[]
  onTalepGuncelle: (id: string, guncelTalep: Partial<Talep>) => void
  onTalepSil: (id: string) => void
  onTalepleriYukle: (talepler: Talep[]) => void
}

type SortField = keyof Talep
type SortDirection = "asc" | "desc"

export default function TalepTable({ talepler, onTalepGuncelle, onTalepSil, onTalepleriYukle }: TalepTableProps) {
  const [sortField, setSortField] = useState<SortField>("guncellemeTarihi")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filters, setFilters] = useState({
    talepSahibi: "",
    talepIlcesi: "",
    talepDurumu: "",
    isletici: "",
    search: "",
  })

  const [editingTalep, setEditingTalep] = useState<Talep | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [raporDialogOpen, setRaporDialogOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleRowExpansion = (talepId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(talepId)) {
      newExpandedRows.delete(talepId)
    } else {
      newExpandedRows.add(talepId)
    }
    setExpandedRows(newExpandedRows)
  }

  const filteredAndSortedTalepler = useMemo(() => {
    const filtered = talepler.filter((talep) => {
      return (
        (!filters.talepSahibi || talep.talepSahibi === filters.talepSahibi) &&
        (!filters.talepIlcesi || talep.talepIlcesi === filters.talepIlcesi) &&
        (!filters.talepDurumu || talep.talepDurumu === filters.talepDurumu) &&
        (!filters.isletici || talep.isletici === filters.isletici) &&
        (!filters.search ||
          talep.talepOzeti.toLowerCase().includes(filters.search.toLowerCase()) ||
          talep.hatNo.toLowerCase().includes(filters.search.toLowerCase()) ||
          talep.yapılanIs.toLowerCase().includes(filters.search.toLowerCase()))
      )
    })

    return filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [talepler, filters, sortField, sortDirection])

  const handleExcelExport = () => {
    const exportData = filteredAndSortedTalepler.map((talep) => ({
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
      "Güncelleme Tarihi": talep.guncellemeTarihi,
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Talepler")
    XLSX.writeFile(wb, `talepler_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const importedTalepler: Talep[] = jsonData.map((row: any, index) => ({
          id: `imported_${Date.now()}_${index}`,
          talepSahibi: row["Talep Sahibi"] || "",
          talepSahibiAciklamasi: row["Talep Sahibi Açıklaması"] || "",
          talepSahibiDigerAciklama: row["Diğer Açıklama"] || "",
          talepIlcesi: row["Talep İlçesi"] || "",
          bolge: row["Bölge"] || "",
          hatNo: row["Hat No"] || "",
          isletici: row["İşletici"] || "",
          talepOzeti: row["Talep Özeti"] || "",
          talepIletimSekli: row["Talep İletim Şekli"] || "",
          evrakTarihi: row["Evrak Tarihi"] || "",
          evrakSayisi: row["Evrak Sayısı"] || "",
          yapılanIs: row["Yapılan İş"] || "",
          talepDurumu: row["Talep Durumu"] || "",
          guncellemeTarihi: row["Güncelleme Tarihi"] || new Date().toLocaleDateString("tr-TR"),
        }))

        onTalepleriYukle(importedTalepler)
        event.target.value = "" // Input'u temizle
      } catch (error) {
        alert("Excel dosyası okunurken hata oluştu. Lütfen dosya formatını kontrol edin.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const getDurumBadgeVariant = (durum: string) => {
    switch (durum) {
      case "Olumlu":
        return "default"
      case "Olumsuz":
        return "destructive"
      case "İletildi":
        return "secondary"
      case "Değerlendirilecek":
        return "outline"
      default:
        return "secondary"
    }
  }

  const uniqueValues = {
    talepSahibi: [...new Set(talepler.map((t) => t.talepSahibi))],
    talepIlcesi: [...new Set(talepler.map((t) => t.talepIlcesi))],
    talepDurumu: [...new Set(talepler.map((t) => t.talepDurumu))],
    isletici: [...new Set(talepler.map((t) => t.isletici))],
  }

  return (
    <div className="space-y-6">
      {/* Rapor Al Butonu */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setRaporDialogOpen(true)} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Rapor Al
          </Button>
        </CardContent>
      </Card>

      {/* Excel İşlemleri */}
      <Card>
        <CardHeader>
          <CardTitle>Excel İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExcelExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Excel'e Aktar
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="excel-import" className="cursor-pointer">
                <Button className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Excel'den Yükle
                </Button>
              </Label>
              <Input
                id="excel-import"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelImport}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Genel Arama</Label>
              <Input
                placeholder="Özet, hat no, yapılan iş..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Talep Sahibi</Label>
              <Select
                value={filters.talepSahibi}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, talepSahibi: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueValues.talepSahibi.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>İlçe</Label>
              <Select
                value={filters.talepIlcesi}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, talepIlcesi: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueValues.talepIlcesi.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={filters.talepDurumu}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, talepDurumu: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueValues.talepDurumu.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>İşletici</Label>
              <Select
                value={filters.isletici}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, isletici: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {uniqueValues.isletici.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tablo */}
      <Card>
        <CardHeader>
          <CardTitle>Talepler ({filteredAndSortedTalepler.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("talepSahibi")}>
                    <div className="flex items-center gap-1">
                      Talep Sahibi
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("talepSahibiAciklamasi")}>
                    <div className="flex items-center gap-1">
                      Açıklama
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("talepIlcesi")}>
                    <div className="flex items-center gap-1">
                      İlçe
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("bolge")}>
                    <div className="flex items-center gap-1">
                      Bölge
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("hatNo")}>
                    <div className="flex items-center gap-1">
                      Hat No
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("isletici")}>
                    <div className="flex items-center gap-1">
                      İşletici
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead>Talep Özeti</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("talepIletimSekli")}>
                    <div className="flex items-center gap-1">
                      İletim Şekli
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead>Yapılan İş</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("talepDurumu")}>
                    <div className="flex items-center gap-1">
                      Durum
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("guncellemeTarihi")}>
                    <div className="flex items-center gap-1">
                      Güncelleme
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTalepler.map((talep) => (
                  <>
                    <TableRow key={talep.id}>
                      <TableCell className="font-medium">{talep.talepSahibi}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="truncate">{talep.talepSahibiAciklamasi}</div>
                          {talep.talepSahibiDigerAciklama && (
                            <div className="text-sm text-muted-foreground truncate">
                              {talep.talepSahibiDigerAciklama}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{talep.talepIlcesi}</TableCell>
                      <TableCell>{talep.bolge}</TableCell>
                      <TableCell>{talep.hatNo}</TableCell>
                      <TableCell>{talep.isletici}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate" title={talep.talepOzeti}>
                          {talep.talepOzeti}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <div className="truncate">{talep.talepIletimSekli}</div>
                          {talep.evrakTarihi && (
                            <div className="text-sm text-muted-foreground">
                              {talep.evrakTarihi} - {talep.evrakSayisi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate" title={talep.yapılanIs}>
                          {talep.yapılanIs}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getDurumBadgeVariant(talep.talepDurumu)}>{talep.talepDurumu}</Badge>
                      </TableCell>
                      <TableCell>{talep.guncellemeTarihi}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRowExpansion(talep.id)}
                            title={expandedRows.has(talep.id) ? "Detayları Gizle" : "Detayları Göster"}
                          >
                            {expandedRows.has(talep.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTalep(talep)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Bu talebi silmek istediğinizden emin misiniz?")) {
                                onTalepSil(talep.id)
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(talep.id) && (
                      <TableRow>
                        <TableCell colSpan={12} className="bg-muted/50">
                          <div className="p-4 space-y-4">
                            <h4 className="font-semibold text-lg mb-3">Talep Detayları</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Talep ID</Label>
                                <p className="text-sm">{talep.id}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Talep Sahibi</Label>
                                <p className="text-sm font-medium">{talep.talepSahibi}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Talep İlçesi</Label>
                                <p className="text-sm">{talep.talepIlcesi}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Bölge</Label>
                                <p className="text-sm">{talep.bolge}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Hat No</Label>
                                <p className="text-sm">{talep.hatNo}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">İşletici</Label>
                                <p className="text-sm">{talep.isletici}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Talep İletim Şekli</Label>
                                <p className="text-sm">{talep.talepIletimSekli}</p>
                              </div>
                              {talep.evrakTarihi && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Evrak Tarihi</Label>
                                  <p className="text-sm">{talep.evrakTarihi}</p>
                                </div>
                              )}
                              {talep.evrakSayisi && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Evrak Sayısı</Label>
                                  <p className="text-sm">{talep.evrakSayisi}</p>
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Talep Durumu</Label>
                                <Badge variant={getDurumBadgeVariant(talep.talepDurumu)}>{talep.talepDurumu}</Badge>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Güncelleme Tarihi</Label>
                                <p className="text-sm">{talep.guncellemeTarihi}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                  Talep Sahibi Açıklaması
                                </Label>
                                <p className="text-sm bg-background p-3 rounded-md border">
                                  {talep.talepSahibiAciklamasi}
                                </p>
                              </div>
                              {talep.talepSahibiDigerAciklama && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Diğer Açıklama</Label>
                                  <p className="text-sm bg-background p-3 rounded-md border">
                                    {talep.talepSahibiDigerAciklama}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Talep Özeti</Label>
                                <p className="text-sm bg-background p-3 rounded-md border">{talep.talepOzeti}</p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Yapılan İş</Label>
                                <p className="text-sm bg-background p-3 rounded-md border">{talep.yapılanIs}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
            {filteredAndSortedTalepler.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Henüz talep bulunmuyor veya filtrelere uygun talep yok.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <TalepEditDialog
        talep={editingTalep}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={onTalepGuncelle}
      />

      {/* Rapor Dialog */}
      <RaporDialog open={raporDialogOpen} onOpenChange={setRaporDialogOpen} />
    </div>
  )
}
