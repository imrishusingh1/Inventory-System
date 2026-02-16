import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import Input from '../common/Input';
import Button from '../common/Button';
import productService from '../../services/productService';

const schema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  category: yup.string().required('Category is required'),
  quantity: yup.number().typeError('Quantity must be a number').min(0, 'Min 0').required('Quantity is required'),
  price: yup.number().typeError('Price must be a number').min(0, 'Min 0').required('Price is required'),
  description: yup.string(),
  supplier: yup.string(),
}).required();

const ProductModal = ({ isOpen, onClose, productToEdit, onSuccess }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (productToEdit) {
      // Set values for edit mode
      const fields = ['name', 'sku', 'category', 'quantity', 'price', 'description', 'supplier'];
      fields.forEach(field => setValue(field, productToEdit[field]));
    } else {
      reset();
    }
  }, [productToEdit, reset, setValue, isOpen]);

  const onSubmit = async (data) => {
    try {
      if (productToEdit) {
        await productService.update(productToEdit._id, data);
        toast.success('Product updated successfully');
      } else {
        await productService.create(data);
        toast.success('Product created successfully');
      }
      onSuccess();
      onClose();
      reset();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {productToEdit ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Product Name" placeholder="e.g. Wireless Mouse" error={errors.name} {...register('name')} />
                  <Input label="SKU" placeholder="e.g. WM-001" error={errors.sku} {...register('sku')} />
                  <Input label="Category" placeholder="e.g. Electronics" error={errors.category} {...register('category')} />
                  <Input label="Supplier" placeholder="e.g. Tech Corp" error={errors.supplier} {...register('supplier')} />
                  <Input label="Quantity" type="number" placeholder="0" error={errors.quantity} {...register('quantity')} />
                  <Input label="Price (₹)" type="number" step="0.01" placeholder="0.00" error={errors.price} {...register('price')} />
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-200 focus:border-brand-500 focus:outline-none transition-all min-h-[100px]"
                    placeholder="Enter product description..."
                    {...register('description')}
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {productToEdit ? 'Save Changes' : 'Create Product'}
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

export default ProductModal;
