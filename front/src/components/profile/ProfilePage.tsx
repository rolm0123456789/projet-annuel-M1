import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate({ to: "/auth" })
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  console.log(user)

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{user?.email}</h3>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.full_name || "Utilisateur"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Email</h4>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Dernière connexion</h4>
            <p className="text-sm text-muted-foreground">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Jamais"}
            </p>
          </div>

          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleSignOut}
          >
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 