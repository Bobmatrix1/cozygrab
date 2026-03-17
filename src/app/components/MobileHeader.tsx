import { useState } from 'react';
import { ShoppingBag, Search, ShoppingCart, Menu, ArrowLeft, Home, Package, User, LogOut, HelpCircle, Settings, FileText } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from './ui/sheet';
import { Separator } from './ui/separator';
import type { Page } from '../App';
import { useAuth } from '../../contexts/AuthContext';

interface MobileHeaderProps {
  onNavigate: (page: Page, productId?: string, orderId?: string, category?: string, query?: string) => void;
  onBack?: () => void;
  cartItemCount?: number;
  showSearch?: boolean;
  showBackButton?: boolean;
  activePage?: Page;
}

export function MobileHeader({ 
    onNavigate, 
    onBack,
    cartItemCount = 0, 
    showSearch = true, 
    showBackButton = false,
    activePage = 'home'
}: MobileHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(activePage, undefined, undefined, undefined, searchTerm);
  };

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    onNavigate('home');
  };

  const menuItems = [
    { label: 'Home', icon: Home, page: 'home' as Page },
    { label: 'Products', icon: Package, page: 'products' as Page },
    { label: 'My Cart', icon: ShoppingCart, page: 'cart' as Page },
    { label: 'My Orders', icon: FileText, page: 'orders' as Page },
    { label: 'Profile', icon: User, page: 'profile' as Page },
  ];

  const secondaryItems = [
    { label: 'Help & Support', icon: HelpCircle, page: 'home' as Page }, // Placeholder pages
    { label: 'Settings', icon: Settings, page: 'profile' as Page },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {showBackButton ? (
              <button onClick={() => onBack ? onBack() : onNavigate('home')} className="flex items-center gap-2">
                  <ArrowLeft className="h-6 w-6" />
              </button>
          ) : (
             <>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                      CozyGrab
                    </SheetTitle>
                    <SheetDescription>Store navigation and account settings.</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col h-full py-6">
                    <div className="flex-1 space-y-6">
                      <div className="space-y-1">
                        {menuItems.map((item) => (
                          <Button
                            key={item.label}
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => handleNavigate(item.page)}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-1">
                        {secondaryItems.map((item) => (
                          <Button
                            key={item.label}
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => handleNavigate(item.page)}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      {user ? (
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start gap-3"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5" />
                          Log Out
                        </Button>
                      ) : (
                        <div className="grid gap-2">
                          <Button 
                            className="w-full" 
                            onClick={() => handleNavigate('login')}
                          >
                            Log In
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleNavigate('signup')}
                          >
                            Sign Up
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">CozyGrab</span>
              </button>
             </>
          )}
        </div>

        <button onClick={() => onNavigate('cart')} className="relative">
          <ShoppingCart className="h-6 w-6" />
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {cartItemCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      )}
    </header>
  );
}
