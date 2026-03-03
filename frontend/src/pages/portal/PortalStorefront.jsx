import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Plus, Minus, ArrowLeft, Store, Tag, Layers, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import orderService from '../../services/orderService';

const PortalStorefront = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({}); // { productId: quantity }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await orderService.getAdminProducts(username);
                setData(res);
            } catch (err) {
                toast.error('Store not found');
                navigate('/portal');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [username]);

    const addToCart = (productId) => {
        setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    };

    const removeFromCart = (productId) => {
        setCart((prev) => {
            const next = { ...prev };
            if (next[productId] > 1) next[productId]--;
            else delete next[productId];
            return next;
        });
    };

    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartTotal = data?.products
        ? data.products.reduce((sum, p) => sum + (cart[p._id] || 0) * p.price, 0)
        : 0;

    const goToCart = () => {
        if (cartCount === 0) return toast.error('Add at least one item to cart');
        const cartItems = Object.entries(cart).map(([productId, quantity]) => ({
            productId,
            quantity,
            product: data.products.find((p) => p._id === productId),
        }));
        navigate('/portal/cart', {
            state: { cartItems, adminUsername: username, adminName: data?.admin?.name },
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Store Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/portal')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Search
                </button>
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                                {data?.admin?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{data?.admin?.name}'s Store</h1>
                                <p className="text-violet-200">@{data?.admin?.username}</p>
                            </div>
                        </div>
                        <p className="text-violet-100 text-sm">{data?.products?.length} products available</p>
                    </div>
                </div>
            </div>

            {/* Floating Cart Button */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.button
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        onClick={goToCart}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-violet-400/40 hover:scale-105 transition-transform"
                    >
                        <ShoppingCart size={20} />
                        <span className="font-semibold">View Cart ({cartCount})</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                            ₹{cartTotal.toFixed(2)}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Products Grid */}
            {data?.products?.length === 0 ? (
                <div className="text-center py-20">
                    <Package size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No products in stock right now</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {data?.products?.map((product, i) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-200 overflow-hidden flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-3">
                                    <Package className="text-white" size={22} />
                                </div>
                                <h3 className="font-bold text-gray-900 text-base leading-tight">{product.name}</h3>
                                {product.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Tag size={12} />
                                        <span>{product.category}</span>
                                    </div>
                                    {product.supplier && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Store size={12} />
                                            <span>{product.supplier}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Layers size={12} />
                                        <span>{product.quantity} in stock</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-extrabold text-gray-900">₹{product.price}</span>

                                    {cart[product._id] ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => removeFromCart(product._id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-6 text-center font-bold text-gray-900 text-sm">
                                                {cart[product._id]}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (cart[product._id] >= product.quantity) {
                                                        return toast.error('Max stock reached');
                                                    }
                                                    addToCart(product._id);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 hover:bg-violet-200 text-violet-600 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product._id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-colors"
                                        >
                                            <Plus size={13} /> Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortalStorefront;
