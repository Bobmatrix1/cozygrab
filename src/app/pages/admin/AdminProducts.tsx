import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Search, Edit, Trash2, MoreVertical, Loader2, UploadCloud, X, ArrowLeft } from 'lucide-react';
import type { Product } from '../../data/mock-data';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../../services/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";

interface AdminProductsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminProducts({ onNavigate, onLogout, onBack }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [stagedPreviews, setStagedPreviews] = useState<string[]>([]);
  const [bulkProducts, setBulkProducts] = useState<any[]>([{ name: '', price: '', category: '', stock: '', file: null, preview: '' }]);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    originalPrice: 0,
    category: '',
    description: '',
    image: '',
    images: [],
    stock: 0,
    inStock: true,
    featured: false,
    bestSeller: false,
    flashDeal: false,
    colors: [],
    sizes: []
  });

  const handleBulkAddRow = () => {
    setBulkProducts([...bulkProducts, { name: '', price: '', category: '', stock: '', file: null, preview: '' }]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkProducts.length > 1) {
      const p = bulkProducts[index];
      if (p.preview) URL.revokeObjectURL(p.preview);
      setBulkProducts(bulkProducts.filter((_, i) => i !== index));
    }
  };

  const updateBulkRow = (index: number, field: string, value: any) => {
    const newBulk = [...bulkProducts];
    newBulk[index][field] = value;
    setBulkProducts(newBulk);
  };

  const handleBulkFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const preview = URL.createObjectURL(file);
          updateBulkRow(index, 'file', file);
          updateBulkRow(index, 'preview', preview);
      }
  };

  const handleSaveBulkProducts = async () => {
    const validProducts = bulkProducts.filter(p => p.name && p.price && p.category);
    if (validProducts.length === 0) {
      toast.error("Please fill in at least one product with name, price, and category");
      return;
    }

    setUploading(true);
    try {
      const promises = validProducts.map(async (p) => {
        let imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
        if (p.file) {
            imageUrl = await uploadToCloudinary(p.file);
        }

        return createProduct({
          name: p.name,
          price: parseFloat(p.price),
          category: p.category,
          stock: parseInt(p.stock) || 0,
          description: `Bulk added product: ${p.name}`,
          image: imageUrl,
          inStock: (parseInt(p.stock) || 0) > 0,
          rating: 0,
          reviewCount: 0,
          featured: false,
          bestSeller: false,
          flashDeal: false,
          colors: [],
          sizes: []
        } as any);
      });

      await Promise.all(promises);
      toast.success(`Successfully added ${validProducts.length} products`);
      
      // Clean up previews
      bulkProducts.forEach(p => p.preview && URL.revokeObjectURL(p.preview));
      
      setIsBulkDialogOpen(false);
      setBulkProducts([{ name: '', price: '', category: '', stock: '', file: null, preview: '' }]);
      fetchProducts();
    } catch (error) {
      console.error("Bulk add products error", error);
      toast.error("Failed to add some products");
    } finally {
      setUploading(false);
    }
  };
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [multipleImageInput, setMultipleImageInput] = useState('');

  const addColor = () => {
      if (colorInput && !formData.colors?.includes(colorInput)) {
          setFormData({ ...formData, colors: [...(formData.colors || []), colorInput] });
          setColorInput('');
      }
  };

  const addSize = () => {
      if (sizeInput && !formData.sizes?.includes(sizeInput)) {
          setFormData({ ...formData, sizes: [...(formData.sizes || []), sizeInput] });
          setSizeInput('');
      }
  };

  const addImageUrl = () => {
      if (multipleImageInput && !formData.images?.includes(multipleImageInput)) {
          setFormData({ ...formData, images: [...(formData.images || []), multipleImageInput] });
          setMultipleImageInput('');
      }
  };

  const removeColor = (color: string) => {
      setFormData({ ...formData, colors: formData.colors?.filter(c => c !== color) });
  };

  const removeSize = (size: string) => {
      setFormData({ ...formData, sizes: formData.sizes?.filter(s => s !== size) });
  };

  const removeImage = (index: number) => {
      setFormData({ ...formData, images: formData.images?.filter((_, i) => i !== index) });
  };

  useEffect(() => {
      fetchProducts();
      fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const data = await getProducts();
        setProducts(data);
    } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
    } finally {
        setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
        const data = await getCategories();
        setCategories(data);
    } catch (error) {
        console.error("Failed to fetch categories", error);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const filesArray = Array.from(e.target.files);
          setSelectedFiles(prev => [...prev, ...filesArray]);
          
          const newPreviews = filesArray.map(file => URL.createObjectURL(file));
          setStagedPreviews(prev => [...prev, ...newPreviews]);
      }
  };

  const removeStagedImage = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setStagedPreviews(prev => {
          const newPreviews = prev.filter((_, i) => i !== index);
          URL.revokeObjectURL(prev[index]);
          return newPreviews;
      });
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
        toast.error("Please fill in required fields");
        return;
    }

    setUploading(true);
    try {
        let imageUrl = formData.image || '';
        let additionalImages = [...(formData.images || [])];
        
        if (selectedFile) {
            imageUrl = await uploadToCloudinary(selectedFile);
        }

        if (selectedFiles.length > 0) {
            const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
            const uploadedUrls = await Promise.all(uploadPromises);
            additionalImages = [...additionalImages, ...uploadedUrls];
        }

        const productData: any = {
            ...formData,
            image: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', // Fallback
            images: additionalImages,
            inStock: (formData.stock || 0) > 0,
        };

        if (editingId) {
            await updateProduct(editingId, productData);
            toast.success('Product updated successfully!');
        } else {
            // New product defaults
            productData.rating = 0;
            productData.reviewCount = 0;
            await createProduct(productData);
            toast.success('Product added successfully!');
        }

        setIsDialogOpen(false);
        resetForm();
        fetchProducts(); // Refresh list
    } catch (error) {
        console.error("Error saving product", error);
        toast.error("Failed to save product");
    } finally {
        setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product", error);
            toast.error("Failed to delete product");
        }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        category: product.category,
        description: product.description,
        image: product.image,
        images: product.images || [],
        stock: product.stock || 0,
        inStock: product.inStock,
        featured: product.featured || false,
        bestSeller: product.bestSeller || false,
        flashDeal: product.flashDeal || false,
        colors: product.colors || [],
        sizes: product.sizes || []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
      setFormData({ 
          name: '', 
          price: 0, 
          originalPrice: 0, 
          category: '', 
          description: '', 
          image: '', 
          images: [],
          stock: 0,
          featured: false,
          bestSeller: false,
          flashDeal: false,
          colors: [],
          sizes: []
      });
      setSelectedFile(null);
      setSelectedFiles([]);
      stagedPreviews.forEach(url => URL.revokeObjectURL(url));
      setStagedPreviews([]);
      setEditingId(null);
  };

  const openAddDialog = () => {
      resetForm();
      setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-products" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Products</h1>
                <p className="text-sm text-muted-foreground">Manage your product catalog</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Bulk Add Products</DialogTitle>
                      <DialogDescription>
                        Quickly add multiple products with basic information.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-1">Img</div>
                        <div className="col-span-3">Product Name*</div>
                        <div className="col-span-3">Category*</div>
                        <div className="col-span-2">Price*</div>
                        <div className="col-span-2">Stock</div>
                        <div className="col-span-1"></div>
                      </div>

                      {bulkProducts.map((p, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1">
                            <Label htmlFor={`bulk-file-${index}`} className="cursor-pointer block aspect-square border-2 border-dashed rounded-md overflow-hidden relative group">
                                {p.preview ? (
                                    <img src={p.preview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <UploadCloud className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                )}
                                <Input 
                                    id={`bulk-file-${index}`}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleBulkFileChange(index, e)}
                                />
                            </Label>
                          </div>
                          <div className="col-span-3">
                            <Input 
                              placeholder="Name" 
                              value={p.name} 
                              onChange={(e) => updateBulkRow(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <Select 
                                value={p.category} 
                                onValueChange={(value) => updateBulkRow(index, 'category', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="z-[101]">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              value={p.price} 
                              onChange={(e) => updateBulkRow(index, 'price', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={p.stock} 
                              onChange={(e) => updateBulkRow(index, 'stock', e.target.value)}
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={bulkProducts.length === 1}
                              onClick={() => removeBulkRow(index)}
                              className="text-destructive h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={handleBulkAddRow} className="w-full border-dashed border-2 py-6">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Row
                      </Button>

                      <p className="text-xs text-muted-foreground pt-2 italic">
                        * Bulk added products will use a default image and description which you can edit later.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveBulkProducts} disabled={uploading}>
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save All Products
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
              ...
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>Fill in the product details below</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input 
                        id="name" 
                        placeholder="Enter product name" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Sale Price</Label>
                        <Input 
                            id="price" 
                            type="number" 
                            placeholder="0.00" 
                            value={formData.price ?? ''}
                            onChange={(e) => setFormData({...formData, price: e.target.value === '' ? undefined : parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (Strike-through)</Label>
                        <Input 
                            id="originalPrice" 
                            type="number" 
                            placeholder="0.00" 
                            value={formData.originalPrice ?? ''}
                            onChange={(e) => setFormData({...formData, originalPrice: e.target.value === '' ? undefined : parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                            value={formData.category} 
                            onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="uncategorized" disabled>
                                        No categories found
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input 
                            id="stock" 
                            type="number" 
                            placeholder="0" 
                            value={formData.stock ?? ''}
                            onChange={(e) => setFormData({...formData, stock: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 py-2 border-y">
                        <p className="text-sm font-medium">Product Badges</p>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="featured" 
                                    checked={formData.featured}
                                    onCheckedChange={(checked) => setFormData({...formData, featured: !!checked})}
                                />
                                <Label htmlFor="featured" className="text-xs">Featured</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="bestSeller" 
                                    checked={formData.bestSeller}
                                    onCheckedChange={(checked) => setFormData({...formData, bestSeller: !!checked})}
                                />
                                <Label htmlFor="bestSeller" className="text-xs">Best Seller</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="flashDeal" 
                                    checked={formData.flashDeal}
                                    onCheckedChange={(checked) => setFormData({...formData, flashDeal: !!checked})}
                                />
                                <Label htmlFor="flashDeal" className="text-xs">Flash Deal</Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Colors</Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Add color" 
                                    value={colorInput} 
                                    onChange={(e) => setColorInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                                />
                                <Button type="button" size="sm" onClick={addColor}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {formData.colors?.map(c => (
                                    <Badge key={c} variant="secondary" className="gap-1">
                                        {c} <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(c)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Sizes</Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Add size" 
                                    value={sizeInput} 
                                    onChange={(e) => setSizeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                />
                                <Button type="button" size="sm" onClick={addSize}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {formData.sizes?.map(s => (
                                    <Badge key={s} variant="secondary" className="gap-1">
                                        {s} <X className="h-3 w-3 cursor-pointer" onClick={() => removeSize(s)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Enter product description" 
                        rows={4} 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">Main Product Image</Label>
                        <div className="flex gap-2">
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Or enter URL manually:</p>
                        <Input 
                            id="image" 
                            placeholder="https://example.com/main-image.jpg" 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <Label>Additional Product Images (for different angles)</Label>
                        <div className="space-y-2">
                            <Input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                onChange={handleMultipleFilesChange} 
                            />
                            <p className="text-xs text-muted-foreground">Upload multiple images from your device</p>
                        </div>
                        
                        {(stagedPreviews.length > 0 || (formData.images && formData.images.length > 0)) && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {/* Saved Images */}
                                {formData.images?.map((url, index) => (
                                    <div key={`saved-${index}`} className="relative group aspect-square border rounded-md overflow-hidden bg-muted">
                                        <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <Badge className="absolute bottom-1 left-1 bg-primary/80 text-[8px] h-3 px-1">Saved</Badge>
                                    </div>
                                ))}
                                {/* Staged Images */}
                                {stagedPreviews.map((url, index) => (
                                    <div key={`staged-${index}`} className="relative group aspect-square border-2 border-dashed border-primary/50 rounded-md overflow-hidden bg-muted">
                                        <img src={url} alt={`Staged ${index + 1}`} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeStagedImage(index)}
                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <Badge className="absolute bottom-1 left-1 bg-orange-500/80 text-[8px] h-3 px-1">New</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                            <Input 
                                placeholder="Add image URL manually" 
                                value={multipleImageInput} 
                                onChange={(e) => setMultipleImageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                            />
                            <Button type="button" size="sm" variant="secondary" onClick={addImageUrl}>Add URL</Button>
                        </div>
                      </div>
                    </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProduct} disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {uploading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Back Button (Bottom Left) */}
          {onBack && (
            <div className="fixed bottom-6 left-6 lg:left-72 z-50">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onBack} 
                    className="rounded-full h-12 w-12 shadow-lg bg-background border-2 hover:bg-accent transition-all active:scale-90"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </div>
          )}

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex flex-col gap-0.5">
                            <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: {product.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{product.category}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">₦{product.price}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(product.stock || 0) > 0 ? (
                          <span className="text-green-600 text-xs font-medium">{product.stock} in stock</span>
                        ) : (
                          <span className="text-red-600 text-xs font-medium">Out of stock</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={(product.stock || 0) > 0 ? 'default' : 'secondary'}>
                          {(product.stock || 0) > 0 ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
