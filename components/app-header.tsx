"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, User } from "lucide-react"
import type { AuthUser } from "@/types/kullanici"
import { isAdmin } from "@/lib/auth"

interface AppHeaderProps {
  user: AuthUser
  onLogout: () => void
  onUserManagement: () => void
}

export default function AppHeader({ user, onLogout, onUserManagement }: AppHeaderProps) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Talep Takip Sistemi</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{user.kullaniciAdi}</span>
            <Badge variant={user.rol === "admin" ? "default" : "secondary"}>
              {user.rol === "admin" ? "Admin" : "Kullanıcı"}
            </Badge>
          </div>

          {isAdmin(user) && (
            <Button variant="outline" size="sm" onClick={onUserManagement}>
              <Settings className="w-4 h-4 mr-2" />
              Sayfa Yönetimi
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </div>
    </header>
  )
}
