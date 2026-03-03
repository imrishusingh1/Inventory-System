import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, ClipboardList, LogOut, PieChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const CustomerPortalLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/portal/login');
    };

    const navLinks = [
        { name: 'Explore Stores', path: '/portal', icon: Search, end: true },
        { name: 'My Orders', path: '/portal/orders', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-violet-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/portal" className="flex items-center gap-2 group">
                            <div className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-md group-hover:shadow-violet-200 transition-shadow">
                                <ShoppingBag className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
                                ShopPortal
                            </span>
                        </Link>

                        {/* Center Nav Links */}
                        <div className="hidden sm:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    end={link.end}
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-violet-100 text-violet-700'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        )
                                    }
                                >
                                    <link.icon size={16} />
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>

                        {/* User + Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    <div className="flex sm:hidden gap-1 pb-3">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-violet-100 text-violet-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    )
                                }
                            >
                                <link.icon size={16} />
                                {link.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default CustomerPortalLayout;
