import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { OrderList } from "@/components/order";
import { User, Package } from "lucide-react";

export default function AccountPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Mon Compte</h1>
                
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Profil</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>Commandes</span>
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="mt-6">
                        <div className="flex justify-center">
                            <ProfileCard />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="orders" className="mt-6">
                        <OrderList />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
