import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Star, ChevronRight, Loader2, ShoppingBag, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { type Product } from '../data/mock-data';
import { getProducts, getCategories } from '../../services/db';
import type { Page } from '../App';
import { useState, useEffect } from 'react';

interface HomeProps {
  onNavigate: (page: Page, productId?: string, orderId?: string, category?: string, query?: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  cartItemCount: number;
  searchQuery?: string;
  activePage?: Page;
}

export function Home({ onNavigate, onAddToCart, cartItemCount, searchQuery, activePage }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
            getProducts(),
            getCategories()
        ]);
        setProducts(productsData);
        setDbCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterBySearch = (p: Product) => {
      if (!searchQuery) return true;
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.category.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const featuredProducts = products.filter(p => p.featured && filterBySearch(p));
  const bestSellers = products.filter(p => p.bestSeller && filterBySearch(p));
  const flashDeals = products.filter(p => p.flashDeal && filterBySearch(p));
  const newArrivals = [...products]
    .filter(filterBySearch)
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 10);

  const heroSlides = [
    {
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
      cta: 'Shop Now',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Discover the latest trends',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      cta: 'Explore',
    },
    {
      title: 'Free Shipping',
      subtitle: 'On orders over $50',
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800',
      cta: 'Learn More',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const renderProductCard = (product: Product) => (
    <Card
      key={product.id}
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onNavigate('product-details', product.id)}
    >
      <div className="relative aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.originalPrice && (
          <Badge className="absolute top-2 left-2 bg-destructive">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">₦{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through ml-1">
                ₦{product.originalPrice}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader onNavigate={onNavigate} cartItemCount={cartItemCount} activePage={activePage} />

      <main>
        {/* Hero Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide, index) => (
              <div key={index} className="min-w-full relative">
                <div className="relative h-48 md:h-64 lg:h-80">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2">{slide.title}</h2>
                    <p className="text-sm md:text-base mb-4">{slide.subtitle}</p>
                    <Button variant="secondary">{slide.cta}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {dbCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate('products', undefined, undefined, category.name)}
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center overflow-hidden border">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-center line-clamp-2">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <section className="p-4 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">⚡ Flash Deals</h2>
                <p className="text-sm text-muted-foreground">Limited time offers</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('products')}>
                See All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {flashDeals.map(renderProductCard)}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Products</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('products')}>
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredProducts.map(renderProductCard)}
          </div>
        </section>

        {/* Best Sellers */}
        <section className="p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Best Sellers</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('products')}>
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {bestSellers.map(renderProductCard)}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">New Arrivals</h2>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('products')}>
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newArrivals.map(renderProductCard)}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="p-4">
          <div className="relative h-40 md:h-48 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200"
              alt="Promo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center text-white p-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Join Our Newsletter</h3>
                <p className="text-sm mb-4">Get 10% off your first order</p>
                <Button variant="secondary">Subscribe Now</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 pt-12 pb-24 lg:pb-12 mt-12 border-t">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Quick Mart</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your one-stop shop for everything you need. Quality products, competitive prices, and fast delivery to your doorstep.
              </p>
              <div className="flex gap-4">
                <button className="p-2 bg-background rounded-full border hover:text-primary transition-colors">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="p-2 bg-background rounded-full border hover:text-primary transition-colors">
                  <Twitter className="h-4 w-4" />
                </button>
                <button className="p-2 bg-background rounded-full border hover:text-primary transition-colors">
                  <Instagram className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('home')} className="text-muted-foreground hover:text-primary transition-colors">Home</button></li>
                <li><button onClick={() => onNavigate('products')} className="text-muted-foreground hover:text-primary transition-colors">Shop All</button></li>
                <li><button onClick={() => onNavigate('orders')} className="text-muted-foreground hover:text-primary transition-colors">My Orders</button></li>
                <li><button onClick={() => onNavigate('profile')} className="text-muted-foreground hover:text-primary transition-colors">Account</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Customer Support</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="text-muted-foreground hover:text-primary transition-colors">Shipping Policy</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors">Returns & Refunds</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</button></li>
                <li><button className="text-muted-foreground hover:text-primary transition-colors">FAQs</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Contact Us</h4>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">+234 000 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">contact@quickmart.com</span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
              <p>© {currentYear} Quick Mart. All rights reserved.</p>
              <div className="flex gap-6">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>PayPal</span>
                <span>Bank Transfer</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <BottomNav currentPage="home" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}
