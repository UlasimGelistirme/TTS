import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST - Toplu talep ekleme (Excel import için)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { talepler } = body

    if (!Array.isArray(talepler) || talepler.length === 0) {
      return NextResponse.json({ error: "Geçerli talep listesi gönderilmedi" }, { status: 400 })
    }

    const results = []

    for (const talep of talepler) {
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
      } = talep

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

      results.push(result[0])
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Toplu talep eklenirken hata:", error)
    return NextResponse.json({ error: "Toplu talep eklenirken hata oluştu" }, { status: 500 })
  }
}
