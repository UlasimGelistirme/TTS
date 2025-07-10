export interface Kullanici {
  id: string
  kullaniciAdi: string
  sifre?: string
  rol: "admin" | "user"
  aktif: boolean
  olusturmaTarihi: string
  guncellemeTarihi: string
}

export interface LoginData {
  kullaniciAdi: string
  sifre: string
}

export interface AuthUser {
  id: string
  kullaniciAdi: string
  rol: "admin" | "user"
}
