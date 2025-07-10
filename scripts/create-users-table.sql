-- Kullanıcılar tablosunu oluştur
CREATE TABLE IF NOT EXISTS kullanicilar (
    id SERIAL PRIMARY KEY,
    kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'user',
    aktif BOOLEAN DEFAULT true,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Güncelleme tarihi için trigger oluştur
CREATE OR REPLACE FUNCTION update_kullanici_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_kullanicilar_guncelleme_tarihi
    BEFORE UPDATE ON kullanicilar
    FOR EACH ROW
    EXECUTE FUNCTION update_kullanici_guncelleme_tarihi();

-- Admin kullanıcısını ekle (şifre: Admin2025)
INSERT INTO kullanicilar (kullanici_adi, sifre, rol) 
VALUES ('Admin', 'Admin2025', 'admin')
ON CONFLICT (kullanici_adi) DO NOTHING;
