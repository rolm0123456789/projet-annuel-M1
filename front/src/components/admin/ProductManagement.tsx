import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService, type Product, type Category } from '@/lib/product-service';
import { formatPrice, getStockBadgeVariant } from '@/lib/admin-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  Plus,
  Package,
  CheckCircle,
  Loader2,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  List,
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image: string;
  images: string;
  category: string;
  categoryId: string;
  brand: string;
  stockQuantity: string;
  tags: string;
  isOnSale: boolean;
  discount: string;
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  image: '',
  images: '',
  category: '',
  categoryId: '',
  brand: '',
  stockQuantity: '',
  tags: '',
  isOnSale: false,
  discount: '0',
};

export function ProductManagement() {
  const { isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Product list state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit dialog
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<ProductFormData>(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete dialog
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>(emptyForm);

  useEffect(() => {
    productService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const p = await productService.getAllProducts();
      setProducts(p);
    } catch {
      // silent
    } finally {
      setProductsLoading(false);
    }
  };

  // Contrôle d'accès
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Accès refusé</h3>
              <p className="text-muted-foreground">
                Cette section est réservée aux administrateurs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'categoryId' && typeof value === 'string') {
      const selectedCategory = categories.find(cat => cat.slug === value);
      if (selectedCategory) {
        setFormData(prev => ({ ...prev, category: selectedCategory.name, categoryId: value }));
      }
    }
  };

  const handleEditInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'categoryId' && typeof value === 'string') {
      const selectedCategory = categories.find(cat => cat.slug === value);
      if (selectedCategory) {
        setEditFormData(prev => ({ ...prev, category: selectedCategory.name, categoryId: value }));
      }
    }
  };

  const buildProductData = (form: ProductFormData) => {
    const priceValue = parseFloat(form.price);
    if (isNaN(priceValue) || priceValue <= 0) throw new Error('Le prix doit être un nombre positif');
    const stockValue = parseInt(form.stockQuantity);
    if (isNaN(stockValue) || stockValue < 0) throw new Error('Le stock doit être un nombre positif ou zéro');
    if (!form.name.trim() || !form.description.trim() || !form.categoryId) {
      throw new Error('Veuillez remplir tous les champs obligatoires');
    }

    const imagesArray = form.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Math.round(priceValue * 100),
      image: form.image.trim() || imagesArray[0] || '',
      images: imagesArray,
      category: form.category,
      categoryId: form.categoryId,
      brand: form.brand.trim(),
      stockQuantity: stockValue,
      tags: tagsArray,
      isOnSale: form.isOnSale,
      discount: form.isOnSale ? parseInt(form.discount) || 0 : 0,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const productData = buildProductData(formData);
      await productService.createProduct(productData);
      setSuccess(true);
      setFormData(emptyForm);
      loadProducts();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: String(product.price / 100),
      image: product.image,
      images: product.images.join('\n'),
      category: product.category,
      categoryId: product.categoryId,
      brand: product.brand,
      stockQuantity: String(product.stockQuantity),
      tags: product.tags.join(', '),
      isOnSale: product.isOnSale,
      discount: String(product.discount),
    });
  };

  const handleEditSubmit = async () => {
    if (!editingProduct) return;
    setEditSubmitting(true);
    try {
      const productData = buildProductData(editFormData);
      await productService.updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleteSubmitting(true);
    try {
      await productService.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleQuickFill = (template: 'iphone' | 'macbook' | 'airpods') => {
    const templates = {
      iphone: {
        name: 'iPhone 15 Pro', description: 'Le dernier iPhone avec puce A17 Pro, appareil photo professionnel et design en titane',
        price: '1299', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
        images: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop\nhttps://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
        categoryId: 'smartphones', category: 'Smartphones', brand: 'Apple', stockQuantity: '15',
        tags: 'nouveau, premium, apple, smartphone', isOnSale: true, discount: '5',
      },
      macbook: {
        name: 'MacBook Air M3', description: 'Ordinateur portable ultra-fin avec puce M3, écran Liquid Retina et autonomie exceptionnelle',
        price: '1299', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
        images: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop\nhttps://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
        categoryId: 'computers', category: 'Ordinateurs', brand: 'Apple', stockQuantity: '8',
        tags: 'ordinateur, portable, apple, performance', isOnSale: false, discount: '0',
      },
      airpods: {
        name: 'AirPods Pro 2', description: 'Écouteurs sans fil avec réduction de bruit active et audio spatial personnalisé',
        price: '279', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
        images: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
        categoryId: 'audio', category: 'Audio', brand: 'Apple', stockQuantity: '25',
        tags: 'écouteurs, sans-fil, apple, audio', isOnSale: true, discount: '7',
      },
    };
    setFormData(templates[template]);
  };

  // Filtered products for list
  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  // Shared form renderer
  const renderProductForm = (
    data: ProductFormData,
    onChange: (field: keyof ProductFormData, value: string | boolean) => void,
    onSubmit: (e: React.FormEvent) => void,
    submitting: boolean,
    submitLabel: string,
  ) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom du produit *</Label>
          <Input value={data.name} onChange={e => onChange('name', e.target.value)} placeholder="ex: iPhone 15 Pro" required />
        </div>
        <div className="space-y-2">
          <Label>Marque *</Label>
          <Input value={data.brand} onChange={e => onChange('brand', e.target.value)} placeholder="ex: Apple" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea value={data.description} onChange={e => onChange('description', e.target.value)} placeholder="Description détaillée du produit..." rows={3} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Prix (€) *</Label>
          <Input type="number" step="0.01" value={data.price} onChange={e => onChange('price', e.target.value)} placeholder="ex: 1299" required />
        </div>
        <div className="space-y-2">
          <Label>Stock *</Label>
          <Input type="number" value={data.stockQuantity} onChange={e => onChange('stockQuantity', e.target.value)} placeholder="ex: 15" required />
        </div>
        <div className="space-y-2">
          <Label>Catégorie *</Label>
          <Select value={data.categoryId} onValueChange={v => onChange('categoryId', v)} disabled={categoriesLoading}>
            <SelectTrigger>
              <SelectValue placeholder={categoriesLoading ? 'Chargement...' : 'Choisir une catégorie'} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Image principale</Label>
        <Input value={data.image} onChange={e => onChange('image', e.target.value)} placeholder="URL de l'image principale" />
      </div>

      <div className="space-y-2">
        <Label>Images supplémentaires</Label>
        <Textarea value={data.images} onChange={e => onChange('images', e.target.value)} placeholder="Une URL par ligne..." rows={3} />
        <p className="text-xs text-muted-foreground">Une URL par ligne.</p>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <Input value={data.tags} onChange={e => onChange('tags', e.target.value)} placeholder="ex: nouveau, premium, apple" />
        <p className="text-xs text-muted-foreground">Séparez les tags par des virgules</p>
      </div>

      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <Switch checked={data.isOnSale} onCheckedChange={checked => onChange('isOnSale', checked)} />
          <Label>Produit en promotion</Label>
        </div>
        {data.isOnSale && (
          <div className="space-y-2">
            <Label>Remise (%)</Label>
            <Input type="number" min="0" max="100" value={data.discount} onChange={e => onChange('discount', e.target.value)} />
          </div>
        )}
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{submitLabel}...</>
        ) : (
          <><Plus className="mr-2 h-4 w-4" />{submitLabel}</>
        )}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Package className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />Liste des produits
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-2" />Ajouter
          </TabsTrigger>
          <TabsTrigger value="templates">Modèles rapides</TabsTrigger>
        </TabsList>

        {/* Product List Tab */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom, marque, catégorie..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={loadProducts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />Actualiser
            </Button>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span>Chargement...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun produit trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const stockBadge = getStockBadgeVariant(product);
                return (
                  <Card key={product.id} className="overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="max-h-40 object-cover mx-5 rounded-2xl" />
                    ) : (
                      <div className="max-h-40 bg-muted flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                        {product.isOnSale && (
                          <Badge className="bg-red-100 text-red-800">-{product.discount}%</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={stockBadge.className}>
                          {stockBadge.label} ({product.stockQuantity})
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(product)}>
                          <Pencil className="h-4 w-4 mr-1" />Modifier
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeletingProduct(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Add Product Tab */}
        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" /><span>Nouveau produit</span>
              </CardTitle>
              <CardDescription>Créez un nouveau produit pour votre catalogue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
                  <CheckCircle className="h-4 w-4" /><span>Produit créé avec succès !</span>
                </div>
              )}
              {renderProductForm(formData, handleInputChange, handleSubmit, isSubmitting, 'Créer le produit')}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modèles prêts à l'emploi</CardTitle>
              <CardDescription>Utilisez ces modèles pour créer rapidement des produits d'exemple</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickFill('iphone')}>
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-2xl">📱</div>
                    <h3 className="font-semibold">iPhone 15 Pro</h3>
                    <p className="text-sm text-muted-foreground">Smartphone premium</p>
                    <Badge variant="secondary">1299€</Badge>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickFill('macbook')}>
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-2xl">💻</div>
                    <h3 className="font-semibold">MacBook Air M3</h3>
                    <p className="text-sm text-muted-foreground">Ordinateur portable</p>
                    <Badge variant="secondary">1299€</Badge>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickFill('airpods')}>
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-2xl">🎧</div>
                    <h3 className="font-semibold">AirPods Pro 2</h3>
                    <p className="text-sm text-muted-foreground">Écouteurs sans fil</p>
                    <Badge variant="secondary">279€</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={open => { if (!open) setEditingProduct(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>Modifiez les informations du produit « {editingProduct?.name} »</DialogDescription>
          </DialogHeader>
          {renderProductForm(
            editFormData,
            handleEditInputChange,
            (e) => { e.preventDefault(); handleEditSubmit(); },
            editSubmitting,
            'Enregistrer les modifications',
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={open => { if (!open) setDeletingProduct(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer « {deletingProduct?.name} » ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
