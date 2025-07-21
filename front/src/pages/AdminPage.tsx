import { AdminOrderManagement, ProductManagement } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, Shield } from "lucide-react";

export default function AdminPage() {
    const { isAdmin, isAuthenticated } = useAuth();

    // Redirection si pas authentifié
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Redirection si pas admin
    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* En-tête */}
                <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Administration</h1>
                        <p className="text-muted-foreground">
                            Gestion des commandes et des produits
                        </p>
                    </div>
                </div>

                {/* Onglets principaux */}
                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="orders" className="flex items-center space-x-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Commandes</span>
                        </TabsTrigger>
                        <TabsTrigger value="products" className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>Produits</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="space-y-6">
                        <AdminOrderManagement />
                    </TabsContent>

                    <TabsContent value="products" className="space-y-6">
                        <ProductManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 