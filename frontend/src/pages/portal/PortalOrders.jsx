import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle2, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';
import orderService from '../../services/orderService';

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const OrderCard = ({ order, index }) => {
    const [expanded, setExpanded] = useState(false);
    const { label, color, icon: Icon } = statusConfig[order.status] || statusConfig.pending;

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
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
                        {order.admin?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{order.admin?.name}'s Store</p>
                        <p className="text-xs text-gray-500">@{order.admin?.username} · {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.items?.length} item{order.items?.length > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
                        <Icon size={12} />
                        {label}
                    </span>
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-50 px-6 py-4 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-2">
                        {order.items?.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                    <Package size={12} className="inline mr-1 text-violet-500" />
                                    {item.name} × {item.quantity}
                                </span>
                                <span className="font-semibold text-gray-800">
                                    ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    {order.note && (
                        <p className="mt-3 text-sm text-gray-500 italic border-t border-gray-100 pt-3">
                            Note: {order.note}
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
};

const PortalOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderService.getMyOrders()
            .then(setOrders)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
                <ClipboardList className="text-violet-600" size={28} />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-sm text-gray-500">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24">
                    <ClipboardList size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No orders yet</p>
                    <p className="text-sm text-gray-400 mt-1">Browse a store and place your first order!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, i) => (
                        <OrderCard key={order._id} order={order} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortalOrders;
