import { ShoppingBag, LayoutDashboard, Package, ShoppingCart, Users, Layers, Settings, LogOut, Menu, Home, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import type { Page } from '../App';
import { useState } from 'react';

interface AdminSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function AdminSidebar({ currentPage, onNavigate, onLogout }: AdminSidebarProps) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { id: 'admin-dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-products' as Page, label: 'Products', icon: Package },
    { id: 'admin-orders' as Page, label: 'Orders', icon: ShoppingCart },
    { id: 'admin-users' as Page, label: 'Users', icon: Users },
    { id: 'admin-categories' as Page, label: 'Categories', icon: Layers },
    { id: 'admin-banners' as Page, label: 'Banners', icon: ImageIcon },
    { id: 'admin-settings' as Page, label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (id: Page) => {
      onNavigate(id);
      setOpen(false);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full py-4">
        {/* Logo (Inside Sheet) */}
        <div className="px-6 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <div>
                        <span className="text-xl font-semibold">CozyGrab</span>
                        <p className="text-xs text-muted-foreground">Admin Panel</p>
                    </div>
                </div>
            </div>
        </div>

        <Separator className="mb-4" />

        {/* Home Button */}
        <div className="px-4 mb-4">
            <Button
                variant="outline"
                onClick={() => onNavigate('home' as Page)}
                className="w-full justify-start gap-3 border-dashed"
            >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
            </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>

        <Separator className="my-4" />

        {/* Logout */}
        <div className="px-4">
            <Button
                variant="ghost"
                onClick={onLogout}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
            </Button>
        </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">
        <NavContent />
      </div>

      {/* Mobile Header Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
          <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-background shadow-md">
                      <Menu className="h-5 w-5" />
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                  <SheetHeader className="sr-only">
                      <SheetTitle>Admin Navigation</SheetTitle>
                      <SheetDescription>Access store management sections.</SheetDescription>
                  </SheetHeader>
                  <NavContent />
              </SheetContent>
          </Sheet>
      </div>
    </>
  );
}
