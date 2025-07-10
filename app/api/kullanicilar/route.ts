import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - Tüm kullanıcıları getir
export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id::text,
        kullanici_adi as "kullaniciAdi",
        rol,
        aktif,
        TO_CHAR(olusturma_tarihi, 'DD.MM.YYYY HH24:MI') as "olusturmaTarihi",
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY HH24:MI') as "guncellemeTarihi"
      FROM kullanicilar 
      ORDER BY olusturma_tarihi DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Kullanıcılar getirilirken hata:", error)
    return NextResponse.json({ error: "Kullanıcılar getirilirken hata oluştu" }, { status: 500 })
  }
}

// POST - Yeni kullanıcı ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kullaniciAdi, sifre, rol = "user" } = body

    if (!kullaniciAdi || !sifre) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre gereklidir" }, { status: 400 })
    }

    // Kullanıcı adının benzersiz olup olmadığını kontrol et
    const existingUser = await sql`
      SELECT id FROM kullanicilar WHERE kullanici_adi = ${kullaniciAdi}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Bu kullanıcı adı zaten kullanılıyor" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO kullanicilar (kullanici_adi, sifre, rol)
      VALUES (${kullaniciAdi}, ${sifre}, ${rol})
      RETURNING 
        id::text,
        kullanici_adi as "kullaniciAdi",
        rol,
        aktif,
        TO_CHAR(olusturma_tarihi, 'DD.MM.YYYY HH24:MI') as "olusturmaTarihi",
        TO_CHAR(guncelleme_tarihi, 'DD.MM.YYYY HH24:MI') as "guncellemeTarihi"
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Kullanıcı eklenirken hata:", error)
    return NextResponse.json({ error: "Kullanıcı eklenirken hata oluştu" }, { status: 500 })
  }
}
