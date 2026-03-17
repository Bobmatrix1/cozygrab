// Mock data for CozyGrab E-commerce App

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  colors?: string[];
  sizes?: string[];
  inStock: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  flashDeal?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  shippingAddress: Address;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

// Mock Categories
export const categories: Category[] = [
  { id: '1', name: 'Electronics', icon: 'Smartphone', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { id: '2', name: 'Fashion', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { id: '3', name: 'Home & Garden', icon: 'Home', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
  { id: '4', name: 'Beauty', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  { id: '5', name: 'Sports', icon: 'Dumbbell', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' },
  { id: '6', name: 'Books', icon: 'Book', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
  { id: '7', name: 'Toys', icon: 'Gamepad2', image: 'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400' },
  { id: '8', name: 'Groceries', icon: 'ShoppingBasket', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
];

// Mock Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 328,
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
    colors: ['Black', 'White', 'Blue'],
    inStock: true,
    featured: true,
    flashDeal: true,
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    price: 199.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    category: 'Electronics',
    rating: 4.8,
    reviewCount: 542,
    description: 'Advanced fitness tracking, heart rate monitor, GPS, and smartphone notifications.',
    colors: ['Black', 'Silver', 'Gold'],
    inStock: true,
    bestSeller: true,
  },
  {
    id: '3',
    name: 'Classic Denim Jacket',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600',
    category: 'Fashion',
    rating: 4.3,
    reviewCount: 156,
    description: 'Timeless denim jacket perfect for any casual occasion.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black'],
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Running Shoes',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    category: 'Sports',
    rating: 4.7,
    reviewCount: 891,
    description: 'Lightweight and comfortable running shoes with excellent support.',
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Black', 'Red'],
    inStock: true,
    bestSeller: true,
  },
  {
    id: '5',
    name: 'Minimalist Backpack',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    category: 'Fashion',
    rating: 4.6,
    reviewCount: 234,
    description: 'Sleek and functional backpack for everyday use.',
    colors: ['Black', 'Gray', 'Navy'],
    inStock: true,
  },
  {
    id: '6',
    name: 'Organic Face Cream',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
    category: 'Beauty',
    rating: 4.4,
    reviewCount: 178,
    description: 'Natural ingredients for radiant and healthy skin.',
    inStock: true,
    flashDeal: true,
  },
  {
    id: '7',
    name: 'Yoga Mat',
    price: 29.99,
    originalPrice: 44.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',
    category: 'Sports',
    rating: 4.5,
    reviewCount: 312,
    description: 'Non-slip yoga mat with extra cushioning for comfort.',
    colors: ['Purple', 'Blue', 'Pink'],
    inStock: true,
  },
  {
    id: '8',
    name: 'Stainless Steel Water Bottle',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
    category: 'Sports',
    rating: 4.8,
    reviewCount: 567,
    description: 'Keep your drinks cold for 24 hours or hot for 12 hours.',
    colors: ['Silver', 'Black', 'Blue'],
    inStock: true,
    bestSeller: true,
  },
  {
    id: '9',
    name: 'Reading Lamp',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    category: 'Home & Garden',
    rating: 4.2,
    reviewCount: 89,
    description: 'Adjustable LED reading lamp with USB charging port.',
    colors: ['White', 'Black'],
    inStock: true,
  },
  {
    id: '10',
    name: 'Coffee Maker',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600',
    category: 'Home & Garden',
    rating: 4.6,
    reviewCount: 445,
    description: 'Programmable coffee maker with thermal carafe.',
    inStock: true,
    featured: true,
  },
  {
    id: '11',
    name: 'Wireless Mouse',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
    category: 'Electronics',
    rating: 4.3,
    reviewCount: 234,
    description: 'Ergonomic wireless mouse with long battery life.',
    colors: ['Black', 'White'],
    inStock: true,
  },
  {
    id: '12',
    name: 'Cookbook Collection',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    category: 'Books',
    rating: 4.7,
    reviewCount: 156,
    description: '100+ delicious recipes for every occasion.',
    inStock: true,
  },
];

// Mock User
export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
};

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    street: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    isDefault: true,
  },
  {
    id: '2',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    street: '456 Oak Avenue',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    country: 'USA',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    date: '2026-02-05',
    status: 'delivered',
    items: [
      {
        product: products[0],
        quantity: 1,
        selectedColor: 'Black',
      },
    ],
    total: 79.99,
    shippingAddress: mockAddresses[0],
  },
  {
    id: 'ORD-002',
    date: '2026-02-03',
    status: 'shipped',
    items: [
      {
        product: products[1],
        quantity: 1,
        selectedColor: 'Silver',
      },
      {
        product: products[7],
        quantity: 2,
        selectedColor: 'Black',
      },
    ],
    total: 249.97,
    shippingAddress: mockAddresses[0],
  },
  {
    id: 'ORD-003',
    date: '2026-01-28',
    status: 'processing',
    items: [
      {
        product: products[3],
        quantity: 1,
        selectedSize: '9',
        selectedColor: 'White',
      },
    ],
    total: 89.99,
    shippingAddress: mockAddresses[1],
  },
];

// Admin Dashboard Mock Data
export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
}

export const adminStats: AdminStats = {
  totalSales: 125840,
  totalOrders: 3421,
  totalUsers: 8934,
  revenue: 342567,
};

export const salesChartData = [
  { month: 'Jan', sales: 42000, orders: 320 },
  { month: 'Feb', sales: 38000, orders: 298 },
  { month: 'Mar', sales: 51000, orders: 412 },
  { month: 'Apr', sales: 47000, orders: 365 },
  { month: 'May', sales: 59000, orders: 478 },
  { month: 'Jun', sales: 54000, orders: 445 },
  { month: 'Jul', sales: 68000, orders: 532 },
];
