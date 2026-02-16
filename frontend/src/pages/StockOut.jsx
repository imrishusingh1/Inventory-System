import React, { useState } from 'react';
import StockModal from '../components/stock/StockModal';
import StockPages from './StockPages';
import Button from '../components/common/Button';
import { ArrowDownCircle, TrendingDown } from 'lucide-react';

const StockOut = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <TrendingDown size={24} />
                        </span>
                        Stock Out
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Record outgoing inventory and sales.</p>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
                 <h2 className="text-lg font-semibold text-gray-900 mb-4">New Removal</h2>
                 <p className="text-gray-500 mb-6">Click below to record a stock removal.</p>
                 <StockWrapper type="OUT" />
            </div>

             <div className="pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Out History</h2>
                <StockPages type="OUT" />
            </div>
        </div>
    );
};

const StockWrapper = ({ type }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsOpen(true)} className={type === 'IN' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                Record Stock {type === 'IN' ? 'Entry' : 'Removal'}
            </Button>
            <StockModal isOpen={isOpen} onClose={() => setIsOpen(false)} type={type} onSuccess={() => window.location.reload()} />
        </>
    )
}

export default StockOut;
