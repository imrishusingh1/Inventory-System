import React, { useState } from 'react';
import StockModal from '../components/stock/StockModal';
import StockPages from './StockPages';
import Button from '../components/common/Button';
import { ArrowUpCircle, TrendingUp } from 'lucide-react';

const StockIn = () => {
    const [isAppearing, setIsAppearing] = useState(false); // To trigger animations if needed

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <TrendingUp size={24} />
                        </span>
                        Stock In
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Register incoming inventory.</p>
                </div>
            </div>

            {/* The Form is usually better as a permanent card on these specific pages, 
                rather than a button that opens a modal, but I'll reuse the modal 
                concept by embedding it or just opening it automatically or simple button. 
                Let's use a "process" card approach for a dedicated page. 
            */}
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl">
                 <h2 className="text-lg font-semibold text-gray-900 mb-4">New Entry</h2>
                 <p className="text-gray-500 mb-6">Click below to record a new stock arrival.</p>
                 <StockWrapper type="IN" />
            </div>

             <div className="pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Stock In History</h2>
                <StockPages type="IN" />
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

export default StockIn;
