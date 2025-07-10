-- Talepler tablosunu oluştur
CREATE TABLE IF NOT EXISTS talepler (
    id SERIAL PRIMARY KEY,
    talep_sahibi VARCHAR(100) NOT NULL,
    talep_sahibi_aciklamasi VARCHAR(200) NOT NULL,
    talep_sahibi_diger_aciklama TEXT,
    talep_ilcesi VARCHAR(50) NOT NULL,
    bolge VARCHAR(10) NOT NULL,
    hat_no VARCHAR(20) NOT NULL,
    isletici VARCHAR(50) NOT NULL,
    talep_ozeti TEXT NOT NULL,
    talep_iletim_sekli VARCHAR(100) NOT NULL,
    evrak_tarihi DATE,
    evrak_sayisi VARCHAR(50),
    yapilan_is TEXT NOT NULL,
    talep_durumu VARCHAR(50) NOT NULL,
    olusturma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Güncelleme tarihi için trigger oluştur
CREATE OR REPLACE FUNCTION update_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_talepler_guncelleme_tarihi
    BEFORE UPDATE ON talepler
    FOR EACH ROW
    EXECUTE FUNCTION update_guncelleme_tarihi();
