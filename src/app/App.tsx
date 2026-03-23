import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { OTP } from './pages/OTP';
import { ProductListing } from './pages/ProductListing';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Profile } from './pages/Profile';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminSettings } from './pages/admin/AdminSettings';
import { Wishlist } from './pages/Wishlist';
import { EditProfile } from './pages/EditProfile';
import { Addresses } from './pages/Addresses';
import { ProfileSettings } from './pages/ProfileSettings';
import { Toaster } from './components/ui/sonner';
import { type Product } from './data/mock-data';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './components/ui/button';

export type Page = 
  | 'home' 
  | 'login' 
  | 'signup' 
  | 'forgot-password' 
  | 'otp'
  | 'products'
  | 'product-details'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-details'
  | 'profile'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-users'
  | 'admin-categories'
  | 'admin-banners'
  | 'admin-settings'
  | 'edit-profile'
  | 'addresses'
  | 'payment-methods'
  | 'wishlist'
  | 'notifications'
  | 'help'
  | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<Page[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { user, isAdmin, logout } = useAuth();
  const { items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount } = useCart();

  const navigateTo = (page: Page, productId?: string, orderId?: string, category?: string, query?: string) => {
    if (page !== currentPage) {
        setHistory(prev => [...prev, currentPage]);
    }
    
    if (productId) {
      setSelectedProductId(productId);
    }
    if (orderId) {
      setSelectedOrderId(orderId);
    }
    if (category !== undefined) {
      setSelectedCategory(category);
    }
    if (query !== undefined) {
      setSearchQuery(query);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const navigateBack = () => {
      if (history.length > 0) {
          const prevPage = history[history.length - 1];
          setHistory(prev => prev.slice(0, -1));
          setCurrentPage(prevPage);
          window.scrollTo(0, 0);
      } else {
          navigateTo('home');
      }
  };

  const handleLogin = () => {
    navigateTo('home');
  };

  const handleAdminLogin = () => {
    navigateTo('admin-dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigateTo('home');
  };

  const handleAdminLogout = async () => {
    await logout();
    navigateTo('admin-login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={navigateTo} onLogin={handleLogin} />;
      case 'signup':
        return <SignUp onNavigate={navigateTo} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={navigateTo} />;
      case 'otp':
        return <OTP onNavigate={navigateTo} />;
      case 'products':
        return (
          <ProductListing
            onNavigate={navigateTo}
            onBack={navigateBack}
            onAddToCart={addToCart}
            cartItemCount={itemCount}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        );
      case 'product-details':
        return (
          <ProductDetails
            product={selectedProduct as Product} 
            productId={selectedProductId || selectedProduct?.id} 
            onNavigate={navigateTo}
            onBack={navigateBack}
            onAddToCart={addToCart}
            cartItemCount={itemCount}
          />
        );
      case 'cart':
        return (
          <Cart
            items={items}
            onNavigate={navigateTo}
            onBack={navigateBack}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        );
      case 'checkout':
        return (
          <Checkout
            items={items}
            onNavigate={navigateTo}
            onBack={navigateBack}
            onClearCart={clearCart}
          />
        );
      case 'orders':
        return (
          <Orders
            orders={[]} // Will be fetched inside Orders
            onNavigate={navigateTo}
            onBack={navigateBack}
            cartItemCount={itemCount}
          />
        );
      case 'order-details':
        return selectedOrderId ? (
          <OrderDetails
            orderId={selectedOrderId}
            orders={[]} // Will be fetched inside
            onNavigate={navigateTo}
            onBack={navigateBack}
          />
        ) : null;
      case 'profile':
        return (
          <Profile
            user={user}
            onNavigate={navigateTo}
            onBack={navigateBack}
            onLogout={handleLogout}
            cartItemCount={itemCount}
          />
        );
      case 'admin-login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      case 'admin-dashboard':
        return isAdmin ? (
          <AdminDashboard onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'admin-products':
        return isAdmin ? (
          <AdminProducts onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'admin-orders':
        return isAdmin ? (
          <AdminOrders onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'admin-users':
        return isAdmin ? (
          <AdminUsers onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'admin-categories':
        return isAdmin ? (
          <AdminCategories onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'admin-banners':
        return isAdmin ? (
          <AdminBanners onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'admin-settings':
        return isAdmin ? (
          <AdminSettings onNavigate={navigateTo} onLogout={handleAdminLogout} onBack={navigateBack} />
        ) : (
          <AdminLogin onLogin={handleAdminLogin} />
        );
      case 'edit-profile':
        return <EditProfile onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} />;
      case 'addresses':
        return <Addresses onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} />;
      case 'wishlist':
        return <Wishlist onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} />;
      case 'payment-methods':
        return <ProfileSettings onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} type="payment" />;
      case 'notifications':
        return <ProfileSettings onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} type="notifications" />;
      case 'help':
        return <ProfileSettings onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} type="help" />;
      case 'settings':
        return <ProfileSettings onNavigate={navigateTo} onBack={navigateBack} cartItemCount={itemCount} type="settings" />;
      default:
        return (
          <Home
            onNavigate={(page, id, oid, cat, q) => {
               // Intercept product selection to set state for now
               if (id) {
                   // We need to fetch or find the product. 
                   // For Home, we probably clicked a product card.
                   // Ideally we pass the ID to ProductDetails and it fetches.
                   // But to keep it working with current state flow:
                   // We will defer to ProductDetails fetching by ID.
               }
               navigateTo(page, id, oid, cat, q);
            }}
            onAddToCart={addToCart}
            cartItemCount={itemCount}
            searchQuery={searchQuery}
            activePage={currentPage}
          />
        );
    }
  };

  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}
