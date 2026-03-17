import { useState, useEffect } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import {
  User,
  MapPin,
  CreditCard,
  Heart,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { mockAddresses } from '../data/mock-data';
import type { Page } from '../App';
import { useAuth } from '../../contexts/AuthContext';
import { getWishlist, getUserOrders } from '../../services/db';

interface ProfileProps {
  user: any; // User from context
  onNavigate: (page: Page) => void;
  onBack: () => void;
  onLogout: () => void;
  cartItemCount: number;
}

export function Profile({ onNavigate, onBack, onLogout, cartItemCount }: ProfileProps) {
  const { user, userData } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const [wishlist, orders] = await Promise.all([
            getWishlist(user.uid),
            getUserOrders(user.uid)
          ]);
          setWishlistCount(wishlist.length);
          setOrderCount(orders.length);
          
          const spent = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          setTotalSpent(spent);
        } catch (error) {
          console.error("Failed to fetch profile data", error);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  if (!user) {
       return (
           <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-4">
               <p>Please log in to view profile.</p>
               <Button onClick={() => onNavigate('login')}>Log In</Button>
           </div>
       )
  }

  const displayName = userData?.name || user.displayName || 'User';
  const displayEmail = user.email || 'No Email';
  const displayPhone = userData?.phone || user.phoneNumber || 'No Phone';

  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      description: 'Name, email, phone',
      onClick: () => onNavigate('edit-profile'),
    },
    {
      icon: MapPin,
      label: 'Saved Addresses',
      description: `${mockAddresses.length} addresses`,
      onClick: () => onNavigate('addresses'),
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      description: 'Manage your cards',
      onClick: () => onNavigate('payment-methods'),
    },
    {
      icon: Heart,
      label: 'Wishlist',
      description: `${wishlistCount} items`,
      onClick: () => onNavigate('wishlist'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notifications',
      onClick: () => onNavigate('notifications'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'FAQs, Contact us',
      onClick: () => onNavigate('help'),
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Privacy, Security',
      onClick: () => onNavigate('settings'),
    },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 10000) {
      return `₦${(value / 1000).toFixed(1)}K`;
    }
    return `₦${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader 
        onNavigate={onNavigate} 
        onBack={onBack}
        cartItemCount={cartItemCount} 
        showSearch={false} 
        showBackButton={true} 
      />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                <AvatarFallback className="text-2xl">
                  {displayName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{displayEmail}</p>
                <p className="text-sm text-muted-foreground">{displayPhone}</p>
                {userData?.role === 'admin' && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => onNavigate('admin-dashboard')}>
                        Access Admin Dashboard
                    </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('orders')}>
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-xl md:text-2xl font-bold">{orderCount}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Orders</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('wishlist')}>
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-xl md:text-2xl font-bold">{wishlistCount}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Wishlist</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-3 md:p-4 text-center overflow-hidden">
              <p className="text-lg md:text-2xl font-bold truncate" title={`₦${totalSpent.toLocaleString()}`}>
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index}>
                  <button
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                  >
                    <div className="bg-accent p-2 rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>

        {/* Version Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>CozyGrab v1.0.0</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <button className="hover:text-foreground">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-foreground">Terms of Service</button>
          </div>
        </div>
      </div>

      <BottomNav currentPage="profile" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}
