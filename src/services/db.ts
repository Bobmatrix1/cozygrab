import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  limit,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product } from "../app/data/mock-data";
import { startOfMonth, subMonths, endOfMonth, isWithinInterval } from 'date-fns';

// --- Products ---

export const getProducts = async (): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, "products", id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Product;
  }
  return null;
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const createProduct = async (product: Omit<Product, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, updates);
};

export const deleteProduct = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "products", id));
};

// --- Orders ---

export interface Order {
    id: string;
    userId: string;
    items: any[];
    totalAmount: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    createdAt: any;
    shippingAddress: any;
}

export const createOrder = async (userId: string, items: any[], totalAmount: number, shippingAddress: any): Promise<string> => {
    const docRef = await addDoc(collection(db, "orders"), {
        userId,
        items,
        totalAmount,
        status: 'pending',
        shippingAddress,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
    const docRef = doc(db, "orders", orderId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Order;
    }
    return null;
};

export const getAllOrders = async (): Promise<Order[]> => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, { status });
};

export const cancelOrder = async (orderId: string): Promise<void> => {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, { status: 'cancelled' });
};

// --- Categories ---

export const getCategories = async (): Promise<any[]> => {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createCategory = async (category: any): Promise<string> => {
    const docRef = await addDoc(collection(db, "categories"), category);
    return docRef.id;
};

export const updateCategory = async (id: string, updates: any): Promise<void> => {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, updates);
};

export const deleteCategory = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "categories", id));
};

// --- Settings ---

export const getStoreSettings = async (): Promise<any> => {
    const docRef = doc(db, "settings", "store");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    // Default settings if none exist
    return {
        storeName: 'CozyGrab',
        storeEmail: 'contact@cozygrab.com',
        storePhone: '+234 000 000 0000',
        storeAddress: 'Lagos, Nigeria',
        maintenanceMode: false,
        storeStatus: true,
        emailNotifications: true
    };
};

export const updateStoreSettings = async (settings: any): Promise<void> => {
    const docRef = doc(db, "settings", "store");
    // Use setDoc with merge to create if doesn't exist
    const { setDoc } = await import("firebase/firestore");
    await setDoc(docRef, settings, { merge: true });
};

// --- Wishlist ---

export const toggleWishlist = async (userId: string, productId: string, isAdding: boolean): Promise<void> => {
    const userRef = doc(db, "users", userId);
    if (isAdding) {
        await updateDoc(userRef, {
            wishlist: arrayUnion(productId)
        });
    } else {
        await updateDoc(userRef, {
            wishlist: arrayRemove(productId)
        });
    }
};

export const getWishlist = async (userId: string): Promise<string[]> => {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
        return snapshot.data().wishlist || [];
    }
    return [];
};

// --- Admin & Stats ---

export const getAllUsers = async (): Promise<any[]> => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateUser = async (userId: string, updates: any): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
};

export const deleteUser = async (userId: string): Promise<void> => {
    await deleteDoc(doc(db, "users", userId));
};

export const getAdminStats = async () => {
    const orders = await getAllOrders();
    const users = await getAllUsers();
    
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonthInterval = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };

    const getOrderStats = (ordersList: Order[]) => {
        const revenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const count = ordersList.length;
        const items = ordersList.reduce((sum, o) => sum + (o.items?.length || 0), 0);
        return { revenue, count, items };
    };

    const parseDate = (createdAt: any) => {
        if (!createdAt) return new Date(0);
        if (createdAt.toDate) return createdAt.toDate();
        if (createdAt instanceof Date) return createdAt;
        return new Date(createdAt);
    };

    const currentOrders = orders.filter(o => isWithinInterval(parseDate(o.createdAt), currentMonthInterval));
    const lastOrders = orders.filter(o => isWithinInterval(parseDate(o.createdAt), lastMonthInterval));

    const currentUsersCount = users.filter(u => isWithinInterval(parseDate(u.createdAt), currentMonthInterval)).length;
    const lastUsersCount = users.filter(u => isWithinInterval(parseDate(u.createdAt), lastMonthInterval)).length;

    const curr = getOrderStats(currentOrders);
    const last = getOrderStats(lastOrders);

    const calcChange = (c: number, l: number) => {
        if (l === 0) return c > 0 ? 100 : 0;
        return ((c - l) / l) * 100;
    };

    return {
        revenue: { 
            total: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
            change: calcChange(curr.revenue, last.revenue)
        },
        orders: {
            total: orders.length,
            change: calcChange(currentOrders.length, lastOrders.length)
        },
        users: {
            total: users.length,
            change: calcChange(currentUsersCount, lastUsersCount)
        },
        sales: {
            total: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
            change: calcChange(curr.items, last.items)
        }
    };
};

export const getSalesChartData = async () => {
    const orders = await getAllOrders();
    const data: Record<string, { sales: number, orders: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize with 0
    months.forEach(m => data[m] = { sales: 0, orders: 0 });

    orders.forEach(order => {
        if (!order.createdAt) return;
        // Timestamp handling: Firestore timestamps have .toDate(), mock data might be strings or Date objects
        let date: Date;
        if (order.createdAt.toDate) {
            date = order.createdAt.toDate();
        } else if (order.createdAt instanceof Date) {
            date = order.createdAt;
        } else {
            date = new Date(order.createdAt);
        }
        
        const month = months[date.getMonth()];
        
        if (data[month]) {
            data[month].sales += order.totalAmount || 0;
            data[month].orders += 1;
        }
    });

    return Object.entries(data).map(([month, stats]) => ({
        month,
        sales: stats.sales,
        orders: stats.orders
    })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
};