import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Warehouse,
  RefreshCw,
  Search,
  AlertTriangle,
  Check,
  X,
  Pencil,
  Package,
} from 'lucide-react';
import { productService, type Product, type Category } from '@/lib/product-service';
import { formatPrice, getStockBadgeVariant } from '@/lib/admin-utils';

type StockFilter = 'all' | 'in-stock' | 'low' | 'out';
type SortOption = 'stock-asc' | 'stock-desc' | 'name-asc' | 'price-asc';

export function StockManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sort, setSort] = useState<SortOption>('stock-asc');

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([
        productService.getAllProducts(),
        productService.getCategories(),
      ]);
      setProducts(p);
      setCategories(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filtered + sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.categoryId === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'out') result = result.filter(p => p.stockQuantity === 0);
    else if (stockFilter === 'low') result = result.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10);
    else if (stockFilter === 'in-stock') result = result.filter(p => p.stockQuantity > 10);

    // Sort
    switch (sort) {
      case 'stock-asc': result.sort((a, b) => a.stockQuantity - b.stockQuantity); break;
      case 'stock-desc': result.sort((a, b) => b.stockQuantity - a.stockQuantity); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
    }

    return result;
  }, [products, search, categoryFilter, stockFilter, sort]);

  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;
  const lowStockCount = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length;

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditValue(String(product.stockQuantity));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveStock = async (product: Product) => {
    const newQty = parseInt(editValue);
    if (isNaN(newQty) || newQty < 0) return;

    setSaving(true);
    try {
      await productService.updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        images: product.images,
        category: product.category,
        categoryId: product.categoryId,
        brand: product.brand,
        stockQuantity: newQty,
        tags: product.tags,
        isOnSale: product.isOnSale,
        discount: product.discount,
      });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockQuantity: newQty } : p));
      setEditingId(null);
    } catch {
      setError('Erreur lors de la mise à jour du stock');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des stocks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Warehouse className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gestion des stocks</h1>
          <Badge variant="outline">Admin</Badge>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}><X className="h-3 w-3" /></Button>
        </div>
      )}

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          {filteredProducts.length} / {products.length} produits
        </Badge>
        {outOfStockCount > 0 && (
          <Badge className="bg-red-100 text-red-800 text-sm py-1 px-3">
            {outOfStockCount} en rupture
          </Badge>
        )}
        {lowStockCount > 0 && (
          <Badge className="bg-orange-100 text-orange-800 text-sm py-1 px-3">
            {lowStockCount} stock limité
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={v => setStockFilter(v as StockFilter)}>
          <SelectTrigger><SelectValue placeholder="Statut stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="in-stock">En stock (&gt;10)</SelectItem>
            <SelectItem value="low">Stock limité (1-10)</SelectItem>
            <SelectItem value="out">Rupture de stock</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
          <SelectTrigger><SelectValue placeholder="Trier par" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stock-asc">Stock croissant</SelectItem>
            <SelectItem value="stock-desc">Stock décroissant</SelectItem>
            <SelectItem value="name-asc">Nom A-Z</SelectItem>
            <SelectItem value="price-asc">Prix croissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Inventaire</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[48px_1fr_100px_100px_120px_100px] gap-3 px-3 py-2 bg-muted/50 rounded-t-md text-sm font-medium text-muted-foreground">
            <span></span>
            <span>Produit</span>
            <span className="text-right">Prix</span>
            <span className="text-center">Stock</span>
            <span className="text-center">Statut</span>
            <span className="text-center">Actions</span>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun produit trouvé</p>
          ) : (
            <div className="divide-y">
              {filteredProducts.map(product => {
                const badge = getStockBadgeVariant(product);
                const isEditing = editingId === product.id;

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-1 md:grid-cols-[48px_1fr_100px_100px_120px_100px] gap-3 px-3 py-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Image */}
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Name + brand + category */}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand} · {product.category}
                      </p>
                    </div>

                    {/* Price */}
                    <span className="text-sm font-semibold text-right">{formatPrice(product.price)}</span>

                    {/* Stock (editable) */}
                    <div className="flex items-center justify-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-20 h-8 text-center text-sm"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveStock(product);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      ) : (
                        <span className={`font-bold text-sm ${productService.getStockStatusColor(product)}`}>
                          {product.stockQuantity}
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex justify-center">
                      <Badge variant="secondary" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center space-x-1">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => saveStock(product)} disabled={saving}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
