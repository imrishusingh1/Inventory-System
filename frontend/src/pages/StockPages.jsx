import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns'; // Need to add date-fns if not present, or use native Date

import stockService from '../services/stockService';
import StockModal from '../components/stock/StockModal';

const StockPages = ({ type }) => { // type: 'IN' | 'OUT' | 'HISTORY'
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(true); // Open automatically for In/Out pages? Maybe not suitable.
  // Actually, specs say "Pages: Stock in form, Stock out form, Stock history table".
  // A cleaner approach: One Stock Management page with tabs or separate routes.
  // Given separate sidebar links provided in Phase 2 sidebar, I'll make wrapper components.
  
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await stockService.getHistory(); // This returns all history
      // We might want to filter client-side if the API doesn't support filtering by type
      setHistory(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load stock history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter history based on view if needed, though History page usually shows all
  const filteredHistory = type === 'HISTORY' 
    ? history 
    : history.filter(h => h.type === type);

  return (
    <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <History size={18} />
                    Recent Stock Movements
                </h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Reason</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading history...</td>
                    </tr>
                ) : filteredHistory.length === 0 ? (
                    <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No stock history found.</td>
                    </tr>
                ) : (
                    filteredHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {item.product?.name || 'Unknown Product'}
                        </td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.type === 'IN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {item.type === 'IN' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                            {item.type}
                        </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">
                            {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            {item.description || item.reason || '-'}
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );
};

export default StockPages;
