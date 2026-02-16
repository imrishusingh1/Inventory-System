import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import Input from '../common/Input';
import Button from '../common/Button';
import stockService from '../../services/stockService';
import productService from '../../services/productService';

const schema = yup.object({
  productId: yup.string().required('Product is required'),
  quantity: yup.number().typeError('Quantity must be a number').positive('Must be positive').integer('Must be an integer').required('Quantity is required'),
  reason: yup.string().required('Reason is required'),
}).required();

const StockModal = ({ isOpen, onClose, type = 'IN', onSuccess }) => { // type: 'IN' | 'OUT'
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        try {
          const data = await productService.getAll();
          setProducts(data);
        } catch (error) {
          toast.error('Failed to load products');
        }
      };
      fetchProducts();
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      if (type === 'IN') {
        await stockService.stockIn(data);
        toast.success('Stock added successfully');
      } else {
        await stockService.stockOut(data);
        toast.success('Stock removed successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const isStockIn = type === 'IN';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {isStockIn ? (
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <ArrowUpCircle size={24} />
                        </div>
                    ) : (
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <ArrowDownCircle size={24} />
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">
                    {isStockIn ? 'Stock In' : 'Stock Out'}
                    </h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                    <select 
                        {...register('productId')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-500 focus:outline-none bg-white"
                    >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.name} (Current: {p.quantity})
                            </option>
                        ))}
                    </select>
                    {errors.productId && (
                        <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.productId.message}</p>
                    )}
                </div>

                <Input 
                    label="Quantity" 
                    type="number" 
                    placeholder="Enter quantity" 
                    error={errors.quantity} 
                    {...register('quantity')} 
                />
                
                <Input 
                    label="Reason" 
                    placeholder={isStockIn ? 'e.g. New Shipment' : 'e.g. Sales Order'} 
                    error={errors.reason} 
                    {...register('reason')} 
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    className={isStockIn ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'}
                  >
                    Confirm {isStockIn ? 'Entry' : 'Removal'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StockModal;
