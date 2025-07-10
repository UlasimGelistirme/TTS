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

// PUT - Talep güncelle (log kaydı ile)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const id = params.id

    // Önce mevcut talebi al
    const mevcutTalep = await sql`
      SELECT * FROM talepler WHERE id = ${id}
    `

    if (mevcutTalep.length === 0) {
      return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 })
    }

    const eskiTalep = mevcutTalep[0]

    await ensureLogsTable() // make sure table exists

    // Güncelleme alanlarını dinamik olarak oluştur
    const updateFields = []
    const values = []
    const logEntries = []

    // Alan eşleştirmeleri
    const fieldMappings = {
      talepSahibi: "talep_sahibi",
      talepSahibiAciklamasi: "talep_sahibi_aciklamasi",
      talepSahibiDigerAciklama: "talep_sahibi_diger_aciklama",
      talepIlcesi: "talep_ilcesi",
      bolge: "bolge",
      hatNo: "hat_no",
      isletici: "isletici",
      talepOzeti: "talep_ozeti",
      talepIletimSekli: "talep_iletim_sekli",
      evrakTarihi: "evrak_tarihi",
      evrakSayisi: "evrak_sayisi",
      yapılanIs: "yapilan_is",
      talepDurumu: "talep_durumu",
    }

    // Her alan için kontrol et ve değişiklik varsa güncelle
    Object.entries(fieldMappings).forEach(([frontendField, dbField]) => {
      if (body[frontendField] !== undefined) {
        const eskiDeger = eskiTalep[dbField]
        const yeniDeger = body[frontendField]

        if (eskiDeger !== yeniDeger) {
          updateFields.push(`${dbField} = $${updateFields.length + 1}`)
          values.push(yeniDeger)

          // Log kaydı için ekle
          logEntries.push({
            alan: frontendField,
            eskiDeger: eskiDeger || "",
            yeniDeger: yeniDeger || "",
          })
        }
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan bulunamadı" }, { status: 400 })
    }

    // ID'yi son parametre olarak ekle
    values.push(id)
    const idParam = `$${values.length}`

    // Talebi güncelle
    const query = `
      UPDATE talepler 
      SET ${updateFields.join(", ")}
      WHERE id = ${idParam}
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

    // Use the `.query` helper for dynamic SQL with placeholder values
    const result = await sql.query(query, values)

    // Log kayıtlarını ekle
    for (const logEntry of logEntries) {
      await sql`
        INSERT INTO talep_guncelleme_loglari (talep_id, degisen_alan, eski_deger, yeni_deger)
        VALUES (${id}, ${logEntry.alan}, ${logEntry.eskiDeger}, ${logEntry.yeniDeger})
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Talep güncellenirken hata:", error)
    return NextResponse.json({ error: "Talep güncellenirken hata oluştu" }, { status: 500 })
  }
}

// DELETE - Talep sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM talepler 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Talep silinirken hata:", error)
    return NextResponse.json({ error: "Talep silinirken hata oluştu" }, { status: 500 })
  }
}
