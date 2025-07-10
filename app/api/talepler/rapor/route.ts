import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

let logsTableReady = false
async function ensureLogsTable() {
  if (logsTableReady) return
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS talep_guncelleme_loglari (
        id SERIAL PRIMARY KEY,
        talep_id INTEGER REFERENCES talepler(id) ON DELETE CASCADE,
        degisen_alan VARCHAR(100) NOT NULL,
        eski_deger TEXT,
        yeni_deger TEXT,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
    logsTableReady = true
  } catch (error) {
    console.error("talep_guncelleme_loglari tablosunu oluştururken hata:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baslangicTarihi, bitisTarihi } = body

    if (!baslangicTarihi || !bitisTarihi) {
      return NextResponse.json({ error: "Başlangıç ve bitiş tarihi gereklidir" }, { status: 400 })
    }

    await ensureLogsTable()

    // Yeni gelen talepler
    const yeniTalepler = await sql`
      SELECT 
        'Yeni Talep' as "kategori",
        id::text,
        talep_sahibi as "talepSahibi",
        talep_sahibi_aciklamasi as "talepSahibiAciklamasi",
        talep_sahibi_diger_aciklama as "talepSahibiDigerAciklama",
        talep_ilcesi as "talepIlcesi",
        bolge,
        hat_no as "hatNo",
        isletici,
        talep_ozeti as "talepOzeti",
        talep_iletim_sekli as "talepIletimSekli",
        evrak_tarihi as "evrakTarihi",
        evrak_sayisi as "evrakSayisi",
        yapilan_is as "yapılanIs",
        talep_durumu as "talepDurumu",
        TO_CHAR(olusturma_tarihi, 'DD.MM.YYYY') as "olusturmaTarihi",
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY') as "guncellemeTarihi"
      FROM talepler 
      WHERE DATE(olusturma_tarihi) BETWEEN ${baslangicTarihi} AND ${bitisTarihi}
      ORDER BY olusturma_tarihi DESC
    `

    // Durum değişikliği yapılan talepler - DISTINCT kaldırıp GROUP BY kullanıyoruz
    const durumDegisiklikleri = await sql`
      SELECT 
        'Durum Değişikliği' as "kategori",
        t.id::text,
        t.talep_sahibi as "talepSahibi",
        t.talep_sahibi_aciklamasi as "talepSahibiAciklamasi",
        t.talep_sahibi_diger_aciklama as "talepSahibiDigerAciklama",
        t.talep_ilcesi as "talepIlcesi",
        t.bolge,
        t.hat_no as "hatNo",
        t.isletici,
        t.talep_ozeti as "talepOzeti",
        t.talep_iletim_sekli as "talepIletimSekli",
        t.evrak_tarihi as "evrakTarihi",
        t.evrak_sayisi as "evrakSayisi",
        t.yapilan_is as "yapılanIs",
        t.talep_durumu as "talepDurumu",
        TO_CHAR(t.olusturma_tarihi, 'DD.MM.YYYY') as "olusturmaTarihi",
        TO_CHAR(t.guncelleme_tarihi, 'DD.MM.YYYY') as "guncellemeTarihi",
        l.eski_deger as "eskiDurum",
        l.yeni_deger as "yeniDurum",
        TO_CHAR(l.guncelleme_tarihi, 'DD.MM.YYYY HH24:MI') as "durumDegisiklikTarihi",
        l.guncelleme_tarihi as "sortTarihi"
      FROM talepler t
      INNER JOIN talep_guncelleme_loglari l ON t.id = l.talep_id
      WHERE l.degisen_alan = 'talepDurumu' 
        AND DATE(l.guncelleme_tarihi) BETWEEN ${baslangicTarihi} AND ${bitisTarihi}
      ORDER BY l.guncelleme_tarihi DESC
    `

    // sortTarihi alanını çıkarıp temizle
    const temizDurumDegisiklikleri = durumDegisiklikleri.map(({ sortTarihi, ...rest }) => rest)

    return NextResponse.json({
      yeniTalepler,
      durumDegisiklikleri: temizDurumDegisiklikleri,
      toplamYeni: yeniTalepler.length,
      toplamDurumDegisikligi: temizDurumDegisiklikleri.length,
    })
  } catch (error) {
    console.error("Rapor oluşturulurken hata:", error)
    return NextResponse.json({ error: "Rapor oluşturulurken hata oluştu" }, { status: 500 })
  }
}
