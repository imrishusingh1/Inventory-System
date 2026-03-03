import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ShoppingBag,
    UserPlus,
    LogIn,
    Package,
    BarChart3,
    Users,
    Zap,
} from 'lucide-react';

const roleCards = [
    {
        type: 'admin',
        action: 'login',
        label: 'Admin Login',
        sub: 'Manage inventory & orders',
        icon: LogIn,
        gradient: 'from-blue-600 to-indigo-700',
        shadow: 'shadow-blue-200',
        hover: 'hover:shadow-blue-300',
        path: '/login',
    },
    {
        type: 'admin',
        action: 'register',
        label: 'Admin Register',
        sub: 'Set up your inventory store',
        icon: UserPlus,
        gradient: 'from-indigo-600 to-violet-700',
        shadow: 'shadow-indigo-200',
        hover: 'hover:shadow-indigo-300',
        path: '/register',
    },
    {
        type: 'customer',
        action: 'login',
        label: 'Customer Login',
        sub: 'Browse stores & place orders',
        icon: ShoppingBag,
        gradient: 'from-violet-600 to-purple-700',
        shadow: 'shadow-violet-200',
        hover: 'hover:shadow-violet-300',
        path: '/portal/login',
    },
    {
        type: 'customer',
        action: 'register',
        label: 'Customer Register',
        sub: 'Create a free shopping account',
        icon: UserPlus,
        gradient: 'from-purple-600 to-pink-600',
        shadow: 'shadow-purple-200',
        hover: 'hover:shadow-purple-300',
        path: '/portal/register',
    },
];

const features = [
    { icon: Package, label: 'Manage Products' },
    { icon: BarChart3, label: 'Track Analytics' },
    { icon: Users, label: 'Customer Orders' },
    { icon: Zap, label: 'Real-time Updates' },
];

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex flex-col">
            {/* Animated background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <LayoutDashboard className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">InventoryMaster</span>
                </div>
                <div className="flex items-center gap-2">
                    {features.map((f) => (
                        <div key={f.label} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                            <f.icon size={12} />
                            {f.label}
                        </div>
                    ))}
                </div>
            </nav>

            {/* Hero */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur text-white/80 rounded-full text-sm font-medium mb-6 border border-white/20">
                        <Zap size={14} className="text-yellow-400" />
                        Smart Inventory + Customer Shopping Portal
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
                        Welcome to <br />
                        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                            InventoryMaster
                        </span>
                    </h1>
                    <p className="text-lg text-white/60 max-w-xl mx-auto mb-14">
                        Whether you're managing stock or shopping from your favourite stores — everything is in one place.
                    </p>
                </motion.div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl w-full mx-auto">
                    {roleCards.map((card, i) => (
                        <motion.button
                            key={card.path}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(card.path)}
                            className={`group relative flex flex-col items-start p-6 rounded-3xl bg-gradient-to-br ${card.gradient} text-white text-left shadow-xl ${card.shadow} hover:${card.hover} hover:shadow-2xl transition-all duration-300 overflow-hidden`}
                        >
                            {/* Decorative circle */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <card.icon size={22} className="text-white" />
                                </div>
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">
                                    {card.type}
                                </p>
                                <h3 className="text-lg font-bold mb-2 leading-tight">{card.label}</h3>
                                <p className="text-sm text-white/70">{card.sub}</p>

                                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-white/90">
                                    <span>Get started</span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-white/30 text-xs"
                >
                    Admin panel for inventory · Customer portal for shopping
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
