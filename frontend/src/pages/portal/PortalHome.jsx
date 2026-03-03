import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Store, ArrowRight, Users, Sparkles, QrCode, Camera } from 'lucide-react';
import orderService from '../../services/orderService';
import QRScannerModal from '../../components/QRScannerModal';

const PortalHome = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    const handleSearch = async (val) => {
        if (!val.trim()) {
            setResults([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const data = await orderService.searchAdmins(val);
            setResults(data);
        } catch (err) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const onChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => handleSearch(val), 400);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        clearTimeout(debounceRef.current);
        handleSearch(query);
    };

    return (
        <>
            {/* QR Scanner Modal */}
            <AnimatePresence>
                {showScanner && <QRScannerModal onClose={() => setShowScanner(false)} />}
            </AnimatePresence>

            <div className="min-h-[80vh] flex flex-col">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-16 px-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-6">
                        <Sparkles size={14} />
                        Discover Products from Trusted Stores
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                        Find Your Perfect{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            Store
                        </span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
                        Search for admin stores by username, or scan a store QR code to browse instantly.
                    </p>

                    {/* Search Bar + QR Button */}
                    <form onSubmit={onSubmit} className="flex gap-3 max-w-lg mx-auto">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={query}
                                onChange={onChange}
                                placeholder="Search by admin username..."
                                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-md hover:shadow-violet-300 hover:scale-105 transition-all duration-200"
                        >
                            Search
                        </button>
                        {/* QR Scanner Button */}
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            title="Scan QR Code"
                            className="px-4 py-3.5 border-2 border-violet-200 text-violet-600 font-semibold rounded-2xl hover:bg-violet-50 hover:border-violet-400 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                        >
                            <QrCode size={20} />
                            <span className="hidden sm:inline text-sm">Scan QR</span>
                        </button>
                    </form>

                    {/* Hint */}
                    <p className="mt-4 text-sm text-gray-400 flex items-center justify-center gap-1.5">
                        <Camera size={13} />
                        Have a store QR code? Click the scan button or search by username above.
                    </p>
                </motion.div>

                {/* Results */}
                <div className="max-w-2xl mx-auto w-full px-4">
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-600"></div>
                        </div>
                    )}

                    {!loading && searched && results.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <Users size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No stores found for "{query}"</p>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {!loading && results.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pb-10">
                                <p className="text-sm text-gray-500 mb-4 font-medium">
                                    {results.length} store{results.length > 1 ? 's' : ''} found
                                </p>
                                {results.map((admin, i) => (
                                    <motion.div
                                        key={admin._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => navigate(`/portal/store/${admin.username}`)}
                                        className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 cursor-pointer transition-all duration-200 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow">
                                                {admin.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{admin.name}</p>
                                                <p className="text-sm text-gray-500">@{admin.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-violet-600 font-medium text-sm group-hover:gap-3 transition-all">
                                            <Store size={16} />
                                            <span className="hidden sm:inline">Visit Store</span>
                                            <ArrowRight size={16} />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!searched && !loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center py-10"
                        >
                            <Store size={64} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400">Start typing to find a store, or scan a QR code</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PortalHome;
