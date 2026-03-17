import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Loader2, 
    ArrowLeft, 
    ShoppingBag,
    UploadCloud,
    X
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../services/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import type { Page } from '../../App';

interface AdminCategoriesProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminCategories({ onNavigate, onLogout, onBack }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '', icon: 'ShoppingBag' });
  const [bulkCategories, setBulkCategories] = useState<any[]>([{ name: '', file: null, preview: '' }]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
      fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
        const data = await getCategories();
        setCategories(data);
    } catch (error) {
        toast.error("Failed to load categories");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const handleBulkAddRow = () => {
    setBulkCategories([...bulkCategories, { name: '', file: null, preview: '' }]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkCategories.length > 1) {
      const p = bulkCategories[index];
      if (p.preview) URL.revokeObjectURL(p.preview);
      setBulkCategories(bulkCategories.filter((_, i) => i !== index));
    }
  };

  const updateBulkRow = (index: number, field: string, value: any) => {
    const newBulk = [...bulkCategories];
    newBulk[index][field] = value;
    setBulkCategories(newBulk);
  };

  const handleBulkFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const preview = URL.createObjectURL(file);
          updateBulkRow(index, 'file', file);
          updateBulkRow(index, 'preview', preview);
      }
  };

  const handleSaveCategory = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
        let imageUrl = formData.image;
        if (selectedFile) {
            imageUrl = await uploadToCloudinary(selectedFile);
        }

        const dataToSave = { ...formData, image: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' };

        if (editingId) {
            await updateCategory(editingId, dataToSave);
            toast.success('Category updated');
        } else {
            await createCategory(dataToSave);
            toast.success('Category created');
        }
        setIsDialogOpen(false);
        setFormData({ name: '', image: '', icon: 'ShoppingBag' });
        setSelectedFile(null);
        setEditingId(null);
        fetchCategories();
    } catch (error) {
        toast.error("Failed to save category");
    } finally {
        setSaving(false);
    }
  };

  const handleBulkAdd = async () => {
      const validCategories = bulkCategories.filter(c => c.name);
      if (validCategories.length === 0) {
          toast.error("Please enter at least one category name");
          return;
      }

      setSaving(true);
      try {
          const promises = validCategories.map(async (c) => {
              let imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
              if (c.file) {
                  imageUrl = await uploadToCloudinary(c.file);
              }
              return createCategory({
                  name: c.name,
                  image: imageUrl,
                  icon: 'ShoppingBag'
              });
          });
          await Promise.all(promises);
          toast.success(`Successfully added ${validCategories.length} categories`);
          
          // Clean up
          bulkCategories.forEach(c => c.preview && URL.revokeObjectURL(c.preview));
          
          setIsBulkDialogOpen(false);
          setBulkCategories([{ name: '', file: null, preview: '' }]);
          fetchCategories();
      } catch (error) {
          console.error("Bulk add error", error);
          toast.error("Failed to add some categories");
      } finally {
          setSaving(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (confirm("Delete this category?")) {
          try {
              await deleteCategory(id);
              toast.success("Category deleted");
              fetchCategories();
          } catch (error) {
              toast.error("Failed to delete category");
          }
      }
  };

  const handleEdit = (cat: any) => {
      setEditingId(cat.id);
      setFormData({ name: cat.name, image: cat.image, icon: cat.icon || 'ShoppingBag' });
      setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-categories" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Categories</h1>
                <p className="text-sm text-muted-foreground">Manage product categories</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Bulk Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Bulk Add Categories</DialogTitle>
                      <DialogDescription>
                        Create multiple categories with images quickly.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="grid grid-cols-12 gap-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-2">Img</div>
                        <div className="col-span-8">Category Name*</div>
                        <div className="col-span-2"></div>
                      </div>

                      {bulkCategories.map((c, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-2">
                            <Label htmlFor={`bulk-cat-file-${index}`} className="cursor-pointer block aspect-square border-2 border-dashed rounded-md overflow-hidden relative group">
                                {c.preview ? (
                                    <img src={c.preview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <UploadCloud className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                )}
                                <Input 
                                    id={`bulk-cat-file-${index}`}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => handleBulkFileChange(index, e)}
                                />
                            </Label>
                          </div>
                          <div className="col-span-8">
                            <Input 
                              placeholder="Category name" 
                              value={c.name} 
                              onChange={(e) => updateBulkRow(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={bulkCategories.length === 1}
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
                        Add Another Category
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkAdd} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create All Categories
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingId(null); setFormData({name:'', image:'', icon:'ShoppingBag'}); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                      <DialogDescription>Create or update a product category</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input 
                          id="categoryName" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter category name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryImage">Category Image</Label>
                        <div className="grid gap-2">
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                            />
                            <p className="text-xs text-muted-foreground text-center">OR</p>
                            <Input 
                              id="categoryImage" 
                              value={formData.image}
                              onChange={(e) => setFormData({...formData, image: e.target.value})}
                              placeholder="https://example.com/image.jpg" 
                            />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveCategory} disabled={saving}>
                          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingId ? 'Update' : 'Add'} Category
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
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

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="overflow-hidden group">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">Product Category</p>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
