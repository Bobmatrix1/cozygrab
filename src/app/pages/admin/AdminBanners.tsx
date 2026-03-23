import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getBanners, createBanner, deleteBanner, type Banner } from '../../../services/db';
import { uploadToCloudinary } from '../../../lib/cloudinary';

interface AdminBannersProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminBanners({ onNavigate, onLogout, onBack }: AdminBannersProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Omit<Banner, 'id'>>({
    title: '',
    subtitle: '',
    image: '',
    cta: 'Shop Now',
    link: ''
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Failed to fetch banners", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveBanner = async () => {
    if (!formData.title || (!formData.image && !selectedFile)) {
      toast.error("Please fill in required fields (Title and Image)");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      await createBanner({
        ...formData,
        image: imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
      });

      toast.success('Banner added successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner", error);
      toast.error("Failed to save banner");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner(id);
        toast.success('Banner deleted successfully!');
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner", error);
        toast.error("Failed to delete banner");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      cta: 'Shop Now',
      link: ''
    });
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-banners" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Banners</h1>
                <p className="text-sm text-muted-foreground">Manage your home page hero carousel</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Banner</DialogTitle>
                    <DialogDescription>Fill in the banner details below</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g. Summer Sale" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input 
                        id="subtitle" 
                        placeholder="e.g. Up to 50% off" 
                        value={formData.subtitle}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta">CTA Button Text</Label>
                      <Input 
                        id="cta" 
                        placeholder="e.g. Shop Now" 
                        value={formData.cta}
                        onChange={(e) => setFormData({...formData, cta: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link">Redirect Link (Optional)</Label>
                      <Input 
                        id="link" 
                        placeholder="e.g. /products?category=Electronics" 
                        value={formData.link}
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Banner Image</Label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Or enter URL manually:</p>
                      <Input 
                        placeholder="https://example.com/banner.jpg" 
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveBanner} disabled={uploading}>
                      {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Banner
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main className="p-6">
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

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Subtitle</TableHead>
                      <TableHead>CTA</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-24 h-12 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{banner.title}</TableCell>
                        <TableCell>{banner.subtitle}</TableCell>
                        <TableCell>{banner.cta}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBanner(banner.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {banners.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No custom banners found. Default banners are currently being displayed.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
