import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Mail, UserCheck } from "lucide-react"

export function ProfileCard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate({ to: "/" })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Aucun utilisateur connecté</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5" />
          <span>Mon Profil</span>
        </CardTitle>
        <CardDescription>Vos informations personnelles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">{user.email}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">ID Utilisateur</p>
              <p className="text-sm text-muted-foreground">#{user.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Rôle</p>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleSignOut} 
            variant="destructive" 
            className="w-full"
          >
            Se déconnecter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 