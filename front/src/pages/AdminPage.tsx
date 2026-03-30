import { AdminOrderManagement, ProductManagement, AdminDashboard, StockManagement } from "@/components/admin";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Package, Warehouse, ShoppingCart, Shield } from "lucide-react";

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
                            Gestion de votre boutique en ligne
                        </p>
                    </div>
                </div>

                {/* Onglets principaux */}
                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden sm:inline">Tableau de bord</span>
                            <span className="sm:hidden">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="products" className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>Produits</span>
                        </TabsTrigger>
                        <TabsTrigger value="stocks" className="flex items-center space-x-2">
                            <Warehouse className="h-4 w-4" />
                            <span>Stocks</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center space-x-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Commandes</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-6">
                        <AdminDashboard />
                    </TabsContent>

                    <TabsContent value="products" className="space-y-6">
                        <ProductManagement />
                    </TabsContent>

                    <TabsContent value="stocks" className="space-y-6">
                        <StockManagement />
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-6">
                        <AdminOrderManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
