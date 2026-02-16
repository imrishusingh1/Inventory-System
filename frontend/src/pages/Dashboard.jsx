import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Package, AlertTriangle,
  IndianRupee, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { toast } from 'react-hot-toast';
import productService from '../services/productService';
import stockService from '../services/stockService';
import reportService from '../services/reportService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    movements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [products, history, summary] = await Promise.all([
          productService.getAll(),
          stockService.getHistory(),
          reportService.getSummary().catch((err) => {
            console.error("Summary error:", err);
            return { totalProducts: 0, lowStockCount: 0, totalStoreValue: 0, stockMovement: [] };
          })
        ]);

        const historyList = Array.isArray(history) ? history : [];

        // Calculate today's activity
        const today = new Date().toDateString();
        const dailyActivity = historyList.filter(m => new Date(m.createdAt).toDateString() === today).length;

        // Use backend summary data
        setStats({
          totalProducts: summary?.totalProducts ?? productList.length,
          totalValue: summary?.totalStoreValue ?? 0,
          lowStock: summary?.lowStockCount ?? 0,
          movements: historyList.slice(0, 5),
          dailyActivity: dailyActivity,
          stockSummary: summary?.stockMovement || []
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Map backend stock movement to chart data
  const chartData = stats.stockSummary?.length > 0
    ? stats.stockSummary.map(item => ({ name: item._id, value: item.totalQuantity }))
    : [{ name: 'IN', value: 0 }, { name: 'OUT', value: 0 }];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500">Here's what's happening with your inventory today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="text-blue-600" size={24} />}
          trend="In Catalog"
          isUp={true}
          color="blue"
        />
        <StatCard
          title="Inventory Value"
          value={`₹${Number(stats.totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<IndianRupee className="text-green-600" size={24} />}
          trend="Total Assets"
          isUp={true}
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle className="text-amber-600" size={24} />}
          trend="Needs Attention"
          isUp={false}
          color="amber"
          warning={stats.lowStock > 0}
        />
        <StatCard
          title="Daily Activity"
          value={stats.dailyActivity}
          icon={<Activity className="text-indigo-600" size={24} />}
          trend="Updates Today"
          isUp={true}
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Stock In vs Out</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 outline-none">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'IN' ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Recent Movements</h3>
          <div className="space-y-6">
            {stats.movements.length > 0 ? stats.movements.map((move, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`p-2 rounded-xl ${move.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {move.type === 'IN' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{move.product?.name}</p>
                  <p className="text-xs text-gray-500">{new Date(move.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`text-sm font-bold ${move.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                  {move.type === 'IN' ? '+' : '-'}{move.quantity}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl transition-colors border border-brand-100">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isUp, color, warning }) => {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${warning ? 'border-amber-200' : 'border-gray-100'} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
    </div>
  );
};

export default Dashboard;
