import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Package, User } from 'lucide-react';
import orderService from '../services/orderService';

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const AdminOrderCard = ({ order, index, onStatusUpdate }) => {
    const [expanded, setExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);
    const { label, color, icon: Icon } = statusConfig[order.status] || statusConfig.pending;

    const handleAction = async (status) => {
        setUpdating(true);
        try {
            await orderService.updateOrderStatus(order._id, status);
            toast.success(`Order ${status}!`);
            onStatusUpdate(order._id, status);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded((p) => !p)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <User className="text-indigo-600" size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{order.customer?.name}</p>
                        <p className="text-xs text-gray-500">@{order.customer?.username} · {order.customer?.email}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.items?.length} item{order.items?.length > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
                        <Icon size={12} /> {label}
                    </span>
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-50 px-6 py-4 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</p>
                    <div className="space-y-2 mb-4">
                        {order.items?.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                    <Package size={12} className="inline mr-1 text-indigo-500" />
                                    {item.name} × {item.quantity}
                                </span>
                                <span className="font-semibold text-gray-800">₹{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    {order.note && (
                        <p className="text-sm text-gray-500 italic border-t border-gray-100 pt-3 mb-4">
                            Note: {order.note}
                        </p>
                    )}
                    {order.status === 'pending' && (
                        <div className="flex gap-3">
                            <button
                                disabled={updating}
                                onClick={() => handleAction('confirmed')}
                                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
                            >
                                ✓ Confirm Order
                            </button>
                            <button
                                disabled={updating}
                                onClick={() => handleAction('rejected')}
                                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
                            >
                                ✗ Reject Order
                            </button>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        orderService.getAdminOrders()
            .then(setOrders)
            .catch(() => toast.error('Failed to load orders'))
            .finally(() => setLoading(false));
    }, []);

    const handleStatusUpdate = (orderId, newStatus) => {
        setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
    };

    const filtered = orders.filter((o) => filter === 'all' || o.status === filter);
    const counts = {
        all: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        rejected: orders.filter((o) => o.status === 'rejected').length,
    };

    const filterTabs = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'rejected', label: 'Rejected' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="text-brand-600" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Orders</h1>
                        <p className="text-sm text-gray-500">{counts.pending} pending review</p>
                    </div>
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === tab.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            <span className="ml-1 text-xs text-gray-400">({counts[tab.key]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-24">
                    <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No {filter !== 'all' ? filter : ''} orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order, i) => (
                        <AdminOrderCard key={order._id} order={order} index={i} onStatusUpdate={handleStatusUpdate} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
