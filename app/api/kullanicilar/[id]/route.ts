import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// PUT - Kullanıcı güncelle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const id = params.id
    const { kullaniciAdi, sifre, rol, aktif } = body

    const updateFields = []
    const values = []

    if (kullaniciAdi !== undefined) {
      updateFields.push(`kullanici_adi = $${updateFields.length + 1}`)
      values.push(kullaniciAdi)
    }

    if (sifre !== undefined) {
      updateFields.push(`sifre = $${updateFields.length + 1}`)
      values.push(sifre)
    }

    if (rol !== undefined) {
      updateFields.push(`rol = $${updateFields.length + 1}`)
      values.push(rol)
    }

    if (aktif !== undefined) {
      updateFields.push(`aktif = $${updateFields.length + 1}`)
      values.push(aktif)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan bulunamadı" }, { status: 400 })
    }

    values.push(id)
    const idParam = `$${values.length}`

    const query = `
      UPDATE kullanicilar 
      SET ${updateFields.join(", ")}
      WHERE id = ${idParam}
      RETURNING 
        id::text,
        kullanici_adi as "kullaniciAdi",
        rol,
        aktif,
        TO_CHAR(olusturma_tarihi, 'DD.MM.YYYY HH24:MI') as "olusturmaTarihi",
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY HH24:MI') as "guncellemeTarihi"
    `

    const result = await sql.query(query, values)

    if (result.length === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Kullanıcı güncellenirken hata:", error)
    return NextResponse.json({ error: "Kullanıcı güncellenirken hata oluştu" }, { status: 500 })
  }
}

// DELETE - Kullanıcı sil
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM kullanicilar 
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Kullanıcı silinirken hata:", error)
    return NextResponse.json({ error: "Kullanıcı silinirken hata oluştu" }, { status: 500 })
  }
}
