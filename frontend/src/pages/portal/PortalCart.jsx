import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';

const PortalCart = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [note, setNote] = useState('');
    const [placing, setPlacing] = useState(false);
    const [items, setItems] = useState(state?.cartItems || []);

    const adminUsername = state?.adminUsername;
    const adminName = state?.adminName;

    const removeItem = (productId) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
    };

    const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    const handlePlaceOrder = async () => {
        if (items.length === 0) return toast.error('Your cart is empty');
        setPlacing(true);
        try {
            const orderItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
            await orderService.placeOrder(adminUsername, orderItems, note);
            toast.success('Order placed successfully! 🎉');
            navigate('/portal/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    if (!state?.cartItems || state.cartItems.length === 0) {
        return (
            <div className="text-center py-24">
                <ShoppingCart size={64} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium mb-4">Your cart is empty</p>
                <button
                    onClick={() => navigate('/portal')}
                    className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-semibold hover:bg-violet-700 transition-colors"
                >
                    Browse Stores
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm font-medium transition-colors"
            >
                <ArrowLeft size={16} /> Back to Store
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart size={22} />
                        Your Cart
                    </h1>
                    <p className="text-violet-200 text-sm mt-1">Ordering from {adminName}'s store</p>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.productId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between px-6 py-4"
                        >
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-500">
                                    ₹{item.product.price} × {item.quantity} ={' '}
                                    <span className="font-semibold text-gray-700">
                                        ₹{(item.product.price * item.quantity).toFixed(2)}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => removeItem(item.productId)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Note */}
                <div className="px-6 py-4 border-t border-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note for admin (optional)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Any special instructions..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-gray-700"
                    />
                </div>

                {/* Total + Place Order */}
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-between py-4 border-t border-gray-100 mb-4">
                        <span className="text-base font-semibold text-gray-700">Total Amount</span>
                        <span className="text-2xl font-extrabold text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={placing || items.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-300/40 hover:shadow-violet-400/50 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {placing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Placing Order...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} /> Place Order
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PortalCart;
