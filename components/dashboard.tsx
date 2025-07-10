"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, FileText, CheckCircle, XCircle, Clock, MapPin, Building } from "lucide-react"
import type { Talep } from "@/types/talep"

interface DashboardProps {
  talepler: Talep[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function Dashboard({ talepler }: DashboardProps) {
  const stats = useMemo(() => {
    const toplam = talepler.length

    // Durum bazında istatistikler
    const durumStats = talepler.reduce(
      (acc, talep) => {
        acc[talep.talepDurumu] = (acc[talep.talepDurumu] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // İlçe bazında istatistikler
    const ilceStats = talepler.reduce(
      (acc, talep) => {
        acc[talep.talepIlcesi] = (acc[talep.talepIlcesi] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // İşletici bazında istatistikler
    const isleticiStats = talepler.reduce(
      (acc, talep) => {
        acc[talep.isletici] = (acc[talep.isletici] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Talep sahibi bazında istatistikler
    const talepSahibiStats = talepler.reduce(
      (acc, talep) => {
        acc[talep.talepSahibi] = (acc[talep.talepSahibi] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Bölge bazında istatistikler
    const bolgeStats = talepler.reduce(
      (acc, talep) => {
        acc[talep.bolge] = (acc[talep.bolge] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // İletim şekli bazında istatistikler
    const iletimStats = talepler.reduce(
      (acc, talep) => {
        acc[talep.talepIletimSekli] = (acc[talep.talepIletimSekli] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Aylık trend (son 6 ay)
    const aylikTrend = talepler.reduce(
      (acc, talep) => {
        const tarih = new Date(talep.guncellemeTarihi.split(".").reverse().join("-"))
        const ay = tarih.toLocaleDateString("tr-TR", { year: "numeric", month: "long" })
        acc[ay] = (acc[ay] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      toplam,
      durumStats,
      ilceStats,
      isleticiStats,
      talepSahibiStats,
      bolgeStats,
      iletimStats,
      aylikTrend,
      olumluOran: toplam > 0 ? Math.round(((durumStats["Olumlu"] || 0) / toplam) * 100) : 0,
      olumsuzOran: toplam > 0 ? Math.round(((durumStats["Olumsuz"] || 0) / toplam) * 100) : 0,
      bekleyenOran:
        toplam > 0
          ? Math.round((((durumStats["İletildi"] || 0) + (durumStats["Değerlendirilecek"] || 0)) / toplam) * 100)
          : 0,
    }
  }, [talepler])

  // Chart data hazırlama
  const durumChartData = Object.entries(stats.durumStats).map(([durum, sayi]) => ({
    name: durum,
    value: sayi,
    percentage: Math.round((sayi / stats.toplam) * 100),
  }))

  const ilceChartData = Object.entries(stats.ilceStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ilce, sayi]) => ({
      name: ilce,
      value: sayi,
    }))

  const bolgeChartData = Object.entries(stats.bolgeStats).map(([bolge, sayi]) => ({
    name: `Bölge ${bolge}`,
    value: sayi,
  }))

  const aylikTrendData = Object.entries(stats.aylikTrend)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6)
    .map(([ay, sayi]) => ({
      name: ay,
      value: sayi,
    }))

  return (
    <div className="space-y-6">
      {/* Ana KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Talep</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.toplam}</div>
            <p className="text-xs text-muted-foreground">Tüm talepler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Olumlu Talepler</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.durumStats["Olumlu"] || 0}</div>
            <p className="text-xs text-muted-foreground">%{stats.olumluOran} başarı oranı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Olumsuz Talepler</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.durumStats["Olumsuz"] || 0}</div>
            <p className="text-xs text-muted-foreground">%{stats.olumsuzOran} red oranı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Talepler</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(stats.durumStats["İletildi"] || 0) + (stats.durumStats["Değerlendirilecek"] || 0)}
            </div>
            <p className="text-xs text-muted-foreground">%{stats.bekleyenOran} işlem bekliyor</p>
          </CardContent>
        </Card>
      </div>

      {/* İkinci Seviye KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İç Paydaş Talepleri</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.talepSahibiStats["İç Paydaş"] || 0}</div>
            <p className="text-xs text-muted-foreground">
              %{stats.toplam > 0 ? Math.round(((stats.talepSahibiStats["İç Paydaş"] || 0) / stats.toplam) * 100) : 0}{" "}
              oranında
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dış Paydaş Talepleri</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.talepSahibiStats["Dış Paydaş"] || 0}</div>
            <p className="text-xs text-muted-foreground">
              %{stats.toplam > 0 ? Math.round(((stats.talepSahibiStats["Dış Paydaş"] || 0) / stats.toplam) * 100) : 0}{" "}
              oranında
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Aktif İlçe</CardTitle>
            <MapPin className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Object.entries(stats.ilceStats).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(stats.ilceStats).sort(([, a], [, b]) => b - a)[0]?.[1] || 0} talep
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Durum Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Talep Durumu Dağılımı</CardTitle>
            <CardDescription>Taleplerin mevcut durumlarına göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={durumChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {durumChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* İlçe Bazında Dağılım */}
        <Card>
          <CardHeader>
            <CardTitle>İlçe Bazında Talep Dağılımı</CardTitle>
            <CardDescription>En çok talep gelen ilçeler (Top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ilceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bölge Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Bölge Bazında Dağılım</CardTitle>
            <CardDescription>Taleplerin bölgelere göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bolgeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Aylık Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Aylık Talep Trendi</CardTitle>
            <CardDescription>Son 6 ayın talep sayıları</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={aylikTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* İşletici ve İletim Şekli İstatistikleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>İşletici Bazında Dağılım</CardTitle>
            <CardDescription>Taleplerin işleticilere göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.isleticiStats).map(([isletici, sayi]) => (
                <div key={isletici} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{isletici}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(sayi / stats.toplam) * 100} className="w-24" />
                    <span className="text-sm font-medium">{sayi}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İletim Şekli Dağılımı</CardTitle>
            <CardDescription>Taleplerin iletim şekillerine göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.iletimStats).map(([iletim, sayi]) => (
                <div key={iletim} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {iletim.length > 20 ? iletim.substring(0, 20) + "..." : iletim}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(sayi / stats.toplam) * 100} className="w-24" />
                    <span className="text-sm font-medium">{sayi}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
