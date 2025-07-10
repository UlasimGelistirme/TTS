import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

let logsTableReady = false
async function ensureLogsTable() {
  if (logsTableReady) return
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
}

// GET - Talep güncelleme loglarını getir
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureLogsTable()
    const id = params.id

    const result = await sql`
      SELECT 
        id,
        degisen_alan as "degisenAlan",
        eski_deger as "eskiDeger",
        yeni_deger as "yeniDeger",
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY HH24:MI') as "guncellemeTarihi"
      FROM talep_guncelleme_loglari 
      WHERE talep_id = ${id}
      ORDER BY guncelleme_tarihi DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Güncelleme logları getirilirken hata:", error)
    return NextResponse.json({ error: "Güncelleme logları getirilirken hata oluştu" }, { status: 500 })
  }
}
