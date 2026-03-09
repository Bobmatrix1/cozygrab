import { useState, useEffect } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../components/ui/sheet';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Star, SlidersHorizontal, Grid3x3, List, Loader2 } from 'lucide-react';
import { categories, type Product } from '../data/mock-data';
import { getProducts, getCategories } from '../../services/db';
import type { Page } from '../App';

interface ProductListingProps {
  onNavigate: (page: Page, productId?: string) => void;
  onAddToCart: (product: Product) => void;
  cartItemCount: number;
  selectedCategory: string | null;
  searchQuery?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating';

export function ProductListing({ onNavigate, onBack, onAddToCart, cartItemCount, selectedCategory, searchQuery }: ProductListingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [priceRange, setPriceRange] = useState([0, 1000000]); // Increased max price
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]); // Real categories
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
        setSelectedCategories([selectedCategory]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
            getProducts(),
            getCategories()
        ]);
        setProducts(productsData);
        setAllCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesRating = product.rating >= minRating;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPrice && matchesCategory && matchesRating && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return b.reviewCount - a.reviewCount;
    }
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const FilterPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        {/* Price Range */}
        <div>
          <h3 className="font-semibold mb-4">Price Range (₦)</h3>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000000}
            step={100}
            className="mb-4"
          />
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Min</span>
                <p className="font-medium">₦{priceRange[0]}</p>
            </div>
            <div className="flex-1 text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Max</span>
                <p className="font-medium">₦{priceRange[1]}</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-4">Categories</h3>
          <div className="grid grid-cols-1 gap-2">
            {allCategories.map(category => (
              <label 
                key={category.id} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCategories.includes(category.name) 
                    ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                    : 'hover:bg-accent border-transparent'
                }`}
              >
                <Checkbox
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() => toggleCategory(category.name)}
                />
                <span className="text-sm font-medium">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="font-semibold mb-4">Minimum Rating</h3>
          <div className="grid grid-cols-2 gap-2">
            {[4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  minRating === rating 
                  ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                  : 'hover:bg-accent border-border'
                }`}
              >
                <div className="flex mb-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold">& Up</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t space-y-2">
        <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
          Apply Filters
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setPriceRange([0, 1000000]);
            setSelectedCategories([]);
            setMinRating(0);
          }}
        >
          Reset All
        </Button>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    if (viewMode === 'list') {
      return (
        <Card
          key={product.id}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onNavigate('product-details', product.id)}
        >
          <div className="flex gap-4 p-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
              {product.originalPrice && (
                <Badge className="absolute top-1 left-1 bg-destructive text-xs">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-2 mb-1">{product.name}</h3>
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
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
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
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <MobileHeader 
        onNavigate={onNavigate} 
        onBack={onBack}
        cartItemCount={cartItemCount} 
        showSearch={false} 
      />

      <div className="p-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Sheet onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="relative active:scale-95 transition-transform"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {(selectedCategories.length > 0 || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] sm:w-96">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
                <SheetDescription>Narrow down your search results by price, category and rating.</SheetDescription>
              </SheetHeader>
              <FilterPanel />
            </SheetContent>
          </Sheet>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {sortedProducts.length} products
        </p>

        {/* Products Grid/List */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-4'
          }
        >
          {sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <BottomNav currentPage="products" onNavigate={onNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}
