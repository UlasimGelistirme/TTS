import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    /* ---------- ensure table & seed admin ---------- */
    await sql`
      CREATE TABLE IF NOT EXISTS kullanicilar (
        id SERIAL PRIMARY KEY,
        kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
        sifre VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'user',
        aktif BOOLEAN DEFAULT true,
        olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      INSERT INTO kullanicilar (kullanici_adi, sifre, rol)
      VALUES ('Admin', 'Admin2025', 'admin')
      ON CONFLICT (kullanici_adi) DO NOTHING;
    `
    /* ---------- /ensure table ---------- */

    const { kullaniciAdi, sifre } = await request.json()

    if (!kullaniciAdi || !sifre) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre gereklidir" }, { status: 400 })
    }

    const result = await sql`
      SELECT id::text,
             kullanici_adi AS "kullaniciAdi",
             rol
        FROM kullanicilar
       WHERE kullanici_adi = ${kullaniciAdi}
         AND sifre        = ${sifre}
         AND aktif        = true
      LIMIT 1;
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre" }, { status: 401 })
    }

    const user = result[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        kullaniciAdi: user.kullaniciAdi,
        rol: user.rol,
      },
    })
  } catch (error) {
    console.error("Giriş yapılırken hata:", error)
    return NextResponse.json({ error: "Giriş yapılırken beklenmeyen bir hata oluştu" }, { status: 500 })
  }
}
