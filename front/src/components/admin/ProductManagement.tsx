import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/lib/product-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Package, CheckCircle, Loader2 } from 'lucide-react';

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

const CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones' },
  { id: 'computers', name: 'Ordinateurs' },
  { id: 'audio', name: 'Audio' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'tablets', name: 'Tablettes' },
  { id: 'wearables', name: 'Wearables' },
  { id: 'tv-video', name: 'TV & Vidéo' },
  { id: 'photo', name: 'Photo' },
  { id: 'smart-home', name: 'Maison connectée' },
  { id: 'accessories', name: 'Accessoires' },
];

export function ProductManagement() {
  const { isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
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
  });

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-remplir category quand categoryId change
    if (field === 'categoryId' && typeof value === 'string') {
      const selectedCategory = CATEGORIES.find(cat => cat.id === value);
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          category: selectedCategory.name,
          categoryId: value
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validation des champs requis
      if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.categoryId) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation du prix
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Le prix doit être un nombre positif');
      }

      // Validation du stock
      const stockValue = parseInt(formData.stockQuantity);
      if (isNaN(stockValue) || stockValue < 0) {
        throw new Error('Le stock doit être un nombre positif ou zéro');
      }

      // Préparation des données
      const imagesArray = formData.images
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Math.round(priceValue * 100), // Conversion en centimes
        image: formData.image.trim() || imagesArray[0] || '',
        images: imagesArray,
        category: formData.category,
        categoryId: formData.categoryId,
        brand: formData.brand.trim(),
        stockQuantity: stockValue,
        tags: tagsArray,
        isOnSale: formData.isOnSale,
        discount: formData.isOnSale ? parseInt(formData.discount) || 0 : 0,
      };

      await productService.createProduct(productData);
      
      setSuccess(true);
      // Reset du formulaire
      setFormData({
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
      });

      // Cacher le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (template: 'iphone' | 'macbook' | 'airpods') => {
    const templates = {
      iphone: {
        name: 'iPhone 15 Pro',
        description: 'Le dernier iPhone avec puce A17 Pro, appareil photo professionnel et design en titane',
        price: '1299',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
        images: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop\nhttps://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
        categoryId: 'smartphones',
        category: 'Smartphones',
        brand: 'Apple',
        stockQuantity: '15',
        tags: 'nouveau, premium, apple, smartphone',
        isOnSale: true,
        discount: '5',
      },
      macbook: {
        name: 'MacBook Air M3',
        description: 'Ordinateur portable ultra-fin avec puce M3, écran Liquid Retina et autonomie exceptionnelle',
        price: '1299',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
        images: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop\nhttps://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
        categoryId: 'computers',
        category: 'Ordinateurs',
        brand: 'Apple',
        stockQuantity: '8',
        tags: 'ordinateur, portable, apple, performance',
        isOnSale: false,
        discount: '0',
      },
      airpods: {
        name: 'AirPods Pro 2',
        description: 'Écouteurs sans fil avec réduction de bruit active et audio spatial personnalisé',
        price: '279',
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
        images: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
        categoryId: 'audio',
        category: 'Audio',
        brand: 'Apple',
        stockQuantity: '25',
        tags: 'écouteurs, sans-fil, apple, audio',
        isOnSale: true,
        discount: '7',
      },
    };

    setFormData(templates[template]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Package className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Ajouter un produit</TabsTrigger>
          <TabsTrigger value="templates">Modèles rapides</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Nouveau produit</span>
              </CardTitle>
              <CardDescription>
                Créez un nouveau produit pour votre catalogue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Messages de feedback */}
              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 text-green-800 rounded-md border border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <span>Produit créé avec succès !</span>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="ex: iPhone 15 Pro"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Marque *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="ex: Apple"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description détaillée du produit..."
                    rows={3}
                    required
                  />
                </div>

                {/* Prix et stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="ex: 1299"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Stock *</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                      placeholder="ex: 15"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Catégorie *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image principale</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="URL de l'image principale"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Images supplémentaires</Label>
                  <Textarea
                    id="images"
                    value={formData.images}
                    onChange={(e) => handleInputChange('images', e.target.value)}
                    placeholder="Une URL par ligne..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Une URL par ligne. Si aucune image principale n'est définie, la première image sera utilisée.
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="ex: nouveau, premium, apple"
                  />
                  <p className="text-xs text-muted-foreground">
                    Séparez les tags par des virgules
                  </p>
                </div>

                {/* Promotion */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isOnSale"
                      checked={formData.isOnSale}
                      onCheckedChange={(checked) => handleInputChange('isOnSale', checked)}
                    />
                    <Label htmlFor="isOnSale">Produit en promotion</Label>
                  </div>

                  {formData.isOnSale && (
                    <div className="space-y-2">
                      <Label htmlFor="discount">Remise (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => handleInputChange('discount', e.target.value)}
                        placeholder="ex: 15"
                      />
                    </div>
                  )}
                </div>

                {/* Bouton de soumission */}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer le produit
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modèles prêts à l'emploi</CardTitle>
              <CardDescription>
                Utilisez ces modèles pour créer rapidement des produits d'exemple
              </CardDescription>
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
    </div>
  );
} 