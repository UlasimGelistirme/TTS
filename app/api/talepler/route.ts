import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Tüm talepleri getir
export async function GET() {
  try {
    const result = await sql`
      SELECT 
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
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY') as "guncellemeTarihi"
      FROM talepler 
      ORDER BY guncelleme_tarihi DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Talepler getirilirken hata:", error)
    return NextResponse.json({ error: "Talepler getirilirken hata oluştu" }, { status: 500 })
  }
}

// POST - Yeni talep ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      talepSahibi,
      talepSahibiAciklamasi,
      talepSahibiDigerAciklama,
      talepIlcesi,
      bolge,
      hatNo,
      isletici,
      talepOzeti,
      talepIletimSekli,
      evrakTarihi,
      evrakSayisi,
      yapılanIs,
      talepDurumu,
    } = body

    const result = await sql`
      INSERT INTO talepler (
        talep_sahibi,
        talep_sahibi_aciklamasi,
        talep_sahibi_diger_aciklama,
        talep_ilcesi,
        bolge,
        hat_no,
        isletici,
        talep_ozeti,
        talep_iletim_sekli,
        evrak_tarihi,
        evrak_sayisi,
        yapilan_is,
        talep_durumu
      ) VALUES (
        ${talepSahibi},
        ${talepSahibiAciklamasi},
        ${talepSahibiDigerAciklama || null},
        ${talepIlcesi},
        ${bolge},
        ${hatNo},
        ${isletici},
        ${talepOzeti},
        ${talepIletimSekli},
        ${evrakTarihi || null},
        ${evrakSayisi || null},
        ${yapılanIs},
        ${talepDurumu}
      )
      RETURNING 
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
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY') as "guncellemeTarihi"
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Talep eklenirken hata:", error)
    return NextResponse.json({ error: "Talep eklenirken hata oluştu" }, { status: 500 })
  }
}
