import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
}).required();

const PortalLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/portal';

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const res = await login(data.email, data.password);
            if (res.user?.role !== 'customer') {
                toast.error('This portal is for customers only. Please use the admin login.');
                return;
            }
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-br from-violet-50 via-white to-indigo-50">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-700">
                <div className="absolute inset-0 opacity-20">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`absolute rounded-full bg-white/30 blur-2xl`}
                            style={{ width: `${100 + i * 50}px`, height: `${100 + i * 50}px`, top: `${i * 15}%`, left: `${i * 10}%` }}
                        />
                    ))}
                </div>
                <div className="relative z-10 text-white p-12 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <ShoppingBag size={80} className="mx-auto mb-6 text-violet-200" />
                        <h1 className="text-4xl font-bold mb-4">Customer Portal</h1>
                        <p className="text-xl text-violet-100 max-w-md mx-auto">
                            Browse stores, discover products, and place orders with ease.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-violet-100">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow">
                                <ShoppingBag className="text-white" size={22} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Customer Sign In</h2>
                            <p className="text-gray-500 mt-2 text-sm">Sign in to your customer account</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input label="Email Address" type="email" placeholder="you@example.com" error={errors.email} {...register('email')} />
                            <Input label="Password" type="password" placeholder="••••••••" error={errors.password} {...register('password')} />

                            <Button type="submit" className="w-full mt-4" size="lg" isLoading={isSubmitting}>
                                Sign In
                            </Button>

                            <p className="text-center text-sm text-gray-600 mt-4">
                                Don't have an account?{' '}
                                <Link to="/portal/register" className="font-semibold text-violet-600 hover:underline">Create one</Link>
                            </p>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                Are you an admin?{' '}
                                <Link to="/login" className="text-gray-500 hover:underline">Admin Login</Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PortalLogin;
