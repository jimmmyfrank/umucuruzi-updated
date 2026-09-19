import { useState, useEffect } from 'react';
import api from '../api';
import {
  Users,
  Store,
  ShoppingBag,
  Box,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#FF6B35', '#2C3E50', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

export default function Dashboard() {
  const [overview, setOverview] = useState({});
  const [ordersOverTime, setOrdersOverTime] = useState([]);
  const [revenueOverTime, setRevenueOverTime] = useState([]);
  const [ordersByHour, setOrdersByHour] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [
        overviewRes,
        ordersRes,
        revenueRes,
        hoursRes,
        topProductsRes,
        categoryRes,
        recentRes
      ] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/orders-over-time?period=day'),
        api.get('/admin/analytics/revenue-over-time?period=day'),
        api.get('/admin/analytics/orders-by-hour'),
        api.get('/admin/analytics/top-products?limit=5'),
        api.get('/admin/analytics/categories-distribution'),
        api.get('/admin/analytics/recent-orders')
      ]);
      setOverview(overviewRes.data);
      setOrdersOverTime(ordersRes.data);
      setRevenueOverTime(revenueRes.data);
      setOrdersByHour(hoursRes.data);
      setTopProducts(topProductsRes.data);
      setCategoryDist(categoryRes.data);
      setRecentOrders(recentRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: 'Total Users', value: overview.totalUsers || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Traders', value: overview.totalTraders || 0, icon: Store, color: 'from-green-500 to-green-600' },
    { label: 'Total Orders', value: overview.totalOrders || 0, icon: ShoppingBag, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Products', value: overview.totalProducts || 0, icon: Box, color: 'from-orange-500 to-orange-600' },
    { label: 'Total Markets', value: overview.totalMarkets || 0, icon: MapPin, color: 'from-pink-500 to-pink-600' },
    { label: 'Revenue (RWF)', value: overview.totalRevenue?.toLocaleString() || 0, icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending Orders', value: overview.pendingOrders || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Delivered Orders', value: overview.deliveredOrders || 0, icon: CheckCircle, color: 'from-teal-500 to-teal-600' },
    { label: 'New Users Today', value: overview.newUsersToday || 0, icon: UserPlus, color: 'from-indigo-500 to-indigo-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Real‑time analytics and insights</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#FF6B35] flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
            <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg text-white shadow-md`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Full‑width Charts ─── */}

      {/* Orders over time */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800">Orders Over Time</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Last 30 days</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={ordersOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey="count" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.2} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue over time */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800">Revenue Over Time</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Last 30 days</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="period" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#2C3E50" fill="#2C3E50" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by hour */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800">Orders by Hour of Day</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">24‑hour distribution</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Categories + Top Products (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Product Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDist}
                dataKey="count"
                nameKey="Category.name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#888" />
              <YAxis dataKey="Product.name" type="category" width={120} stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Bar dataKey="total_sold" fill="#FF6B35" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-bold text-lg mb-4 text-gray-800">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trader</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (RWF)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer?.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.trader?.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.final_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}