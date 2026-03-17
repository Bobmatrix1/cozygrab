import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminStats, getSalesChartData, getAllOrders, type Order } from '../../../services/db';
import type { Page } from '../../App';
import { format } from 'date-fns';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onBack?: () => void;
}

const statusColors: any = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: any = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function AdminDashboard({ onNavigate, onLogout, onBack }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, chartData, ordersData] = await Promise.all([
          getAdminStats(),
          getSalesChartData(),
          getAllOrders()
        ]);
        setStats(statsData);
        setChartData(chartData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₦${stats.revenue.total.toLocaleString()}`,
      change: stats.revenue.change,
      icon: (props: any) => (
        <svg
          {...props}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4v16" />
          <path d="M18 4v16" />
          <path d="M6 4l12 16" />
          <path d="M4 10h16" />
          <path d="M4 14h16" />
        </svg>
      ),
      color: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.orders.total.toLocaleString(),
      change: stats.orders.change,
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: stats.users.total.toLocaleString(),
      change: stats.users.change,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Items Sold',
      value: stats.sales.total.toLocaleString(),
      change: stats.sales.change,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentPage="admin-dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="p-6 flex items-center justify-between pl-16 lg:pl-6">
            <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back! Here's your business overview</p>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onNavigate('home' as Page)}
                className="hidden md:flex items-center gap-2"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Store
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
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
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const isPositive = stat.change >= 0;
              return (
                <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight break-words leading-none">
                          {stat.value}
                        </h3>
                        <div className={`text-xs md:text-sm pt-1 flex flex-wrap items-center gap-1.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="font-bold inline-flex items-center">
                            {isPositive ? '+' : ''}{stat.change.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground font-normal whitespace-nowrap">vs last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl bg-accent/50 shrink-0 ${stat.color} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('admin-orders')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                            {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recent'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <p className="font-semibold">₦{order.totalAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
