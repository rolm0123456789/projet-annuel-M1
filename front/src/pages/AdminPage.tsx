import { AdminOrderManagement } from "@/components/admin/AdminOrderManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "@tanstack/react-router";

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
            <div className="max-w-6xl mx-auto">
                <AdminOrderManagement />
            </div>
        </div>
    );
} 