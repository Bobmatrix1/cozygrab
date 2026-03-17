import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Minus, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../data/mock-data';
import type { Page } from '../App';
import { getProductById, toggleWishlist, getWishlist } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

interface ProductDetailsProps {
  product: Product; // Can be partial or full product passed from listing
  productId?: string; // ID to fetch full details if needed
  onNavigate: (page: Page) => void;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  cartItemCount: number;
}

export function ProductDetails({ product: initialProduct, productId, onNavigate, onBack, onAddToCart, cartItemCount }: ProductDetailsProps) {
  const { user } = useAuth();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(initialProduct?.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(initialProduct?.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId && (!initialProduct || initialProduct.id !== productId)) {
        setLoading(true);
        try {
            const fetched = await getProductById(productId);
            if (fetched) {
                setProduct(fetched);
                // Reset selections when product changes
                setSelectedColor(fetched.colors?.[0]);
                setSelectedSize(fetched.sizes?.[0]);
                setSelectedImage(0);
                setQuantity(1);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load product details");
        } finally {
            setLoading(false);
        }
      } else if (initialProduct) {
          setProduct(initialProduct);
          if (initialProduct.colors && initialProduct.colors.length > 0 && !selectedColor) {
              setSelectedColor(initialProduct.colors[0]);
          }
          if (initialProduct.sizes && initialProduct.sizes.length > 0 && !selectedSize) {
              setSelectedSize(initialProduct.sizes[0]);
          }
      }
    };
    fetchProduct();
  }, [productId, initialProduct]);

  useEffect(() => {
      const checkWishlist = async () => {
          if (user && product?.id) {
              try {
                  const wishlist = await getWishlist(user.uid);
                  setIsFavorite(wishlist.includes(product.id));
              } catch (error) {
                  console.error("Error checking wishlist", error);
              }
          }
      };
      checkWishlist();
  }, [user, product?.id]);

  const handleToggleWishlist = async () => {
      if (!user) {
          toast.error("Please login to add to wishlist");
          return;
      }
      try {
          const newStatus = !isFavorite;
          setIsFavorite(newStatus); // Optimistic update
          await toggleWishlist(user.uid, product.id, newStatus);
          toast.success(newStatus ? 'Added to wishlist' : 'Removed from wishlist');
      } catch (error) {
          setIsFavorite(!isFavorite); // Revert on error
          console.error("Error toggling wishlist", error);
          toast.error("Failed to update wishlist");
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (!product) {
       return <div className="min-h-screen flex items-center justify-center p-4">
           <div className="text-center">
               <h2 className="text-xl font-semibold mb-4">Product not found</h2>
               <Button onClick={() => onNavigate('home')}>Go Home</Button>
           </div>
       </div>;
  }

  const images = product ? [product.image, ...(product.images || [])] : [];

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    onNavigate('cart');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => toast.success('Shared!')}>
              <Share2 className="h-5 w-5" />
            </button>
            <button onClick={() => onNavigate('cart')} className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto lg:p-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <div className="relative aspect-square bg-accent">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.originalPrice && (
                <Badge className="absolute top-4 left-4 bg-destructive">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
              <button
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 bg-white rounded-full p-2"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.inStock ? (
                  <Badge className="bg-green-500">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
              <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">₦{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₦{product.originalPrice}
                  </span>
                  <Badge variant="destructive">
                    Save ₦{(product.originalPrice - product.price).toFixed(2)}
                  </Badge>
                </>
              )}
            </div>

            <Separator />

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Color: {selectedColor}</h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md border-2 ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Size: {selectedSize}</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md border-2 ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-accent"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleAddToCart} variant="outline" className="flex-1">
                Add to Cart
              </Button>
              <Button onClick={handleBuyNow} className="flex-1">
                Buy Now
              </Button>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-medium mb-3">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Features */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Shipping</span>
                  <span className="font-medium">On orders over $50</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return Policy</span>
                  <span className="font-medium">30 days return</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warranty</span>
                  <span className="font-medium">1 year warranty</span>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Preview */}
            <div>
              <h3 className="font-medium mb-3">Customer Reviews</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{product.rating}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {product.reviewCount} reviews
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-xs w-4">{stars}</span>
                          <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${Math.random() * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    See All Reviews
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
