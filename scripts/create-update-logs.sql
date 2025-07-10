-- Güncelleme logları tablosunu oluştur
CREATE TABLE IF NOT EXISTS talep_guncelleme_loglari (
    id SERIAL PRIMARY KEY,
    talep_id INTEGER REFERENCES talepler(id) ON DELETE CASCADE,
    degisen_alan VARCHAR(100) NOT NULL,
    eski_deger TEXT,
    yeni_deger TEXT,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index ekle performans için
CREATE INDEX IF NOT EXISTS idx_talep_guncelleme_loglari_talep_id ON talep_guncelleme_loglari(talep_id);
CREATE INDEX IF NOT EXISTS idx_talep_guncelleme_loglari_tarih ON talep_guncelleme_loglari(guncelleme_tarihi);
