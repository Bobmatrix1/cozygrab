import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Page } from '../../App';
import { getStoreSettings, updateStoreSettings } from '../../../services/db';

interface AdminSettingsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

export function AdminSettings({ onNavigate, onLogout, onBack }: AdminSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    maintenanceMode: false,
    storeStatus: true,
    emailNotifications: true
  });

  useEffect(() => {
      fetchSettings();
  }, []);

  const fetchSettings = async () => {
      setLoading(true);
      try {
          const data = await getStoreSettings();
          setSettings(data);
      } catch (error) {
          toast.error("Failed to load settings");
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async (updates: any) => {
    setSaving(true);
    try {
        const newSettings = { ...settings, ...updates };
        await updateStoreSettings(newSettings);
        setSettings(newSettings);
        toast.success('Settings saved successfully!');
    } catch (error) {
        toast.error('Failed to save settings');
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-settings" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 pl-16 lg:pl-6 flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage store settings and preferences</p>
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

          <Tabs defaultValue="store" className="space-y-6">
            <TabsList>
              <TabsTrigger value="store">Store Info</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="admin">Admin Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                        id="storeName" 
                        value={settings.storeName} 
                        onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input 
                        id="storeEmail" 
                        type="email" 
                        value={settings.storeEmail} 
                        onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input 
                        id="storePhone" 
                        value={settings.storePhone} 
                        onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">Store Address</Label>
                    <Textarea 
                        id="storeAddress" 
                        value={settings.storeAddress} 
                        onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                    />
                  </div>
                  <Button onClick={() => handleSave(settings)} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Store Status</p>
                      <p className="text-sm text-muted-foreground">Make store visible to customers</p>
                    </div>
                    <Switch 
                        checked={settings.storeStatus} 
                        onCheckedChange={(checked) => handleSave({ storeStatus: checked })} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Disable customer access</p>
                    </div>
                    <Switch 
                        checked={settings.maintenanceMode} 
                        onCheckedChange={(checked) => handleSave({ maintenanceMode: checked })} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Send order notifications</p>
                    </div>
                    <Switch 
                        checked={settings.emailNotifications} 
                        onCheckedChange={(checked) => handleSave({ emailNotifications: checked })} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Credit/Debit Cards</p>
                      <p className="text-sm text-muted-foreground">Accept card payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Digital Wallets</p>
                      <p className="text-sm text-muted-foreground">PayPal, Apple Pay, Google Pay</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">COD payments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Standard Shipping</p>
                      <p className="text-sm text-muted-foreground">5-7 business days - ₦5.99</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Express Shipping</p>
                      <p className="text-sm text-muted-foreground">2-3 business days - ₦15.99</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-sm text-muted-foreground">On orders over ₦50</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Name</Label>
                    <Input id="adminName" defaultValue="Admin User" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input id="adminEmail" type="email" defaultValue="admin@cozygrab.com" />
                  </div>
                  <Button onClick={() => toast.success("Admin profile updated")}>Update Profile</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}