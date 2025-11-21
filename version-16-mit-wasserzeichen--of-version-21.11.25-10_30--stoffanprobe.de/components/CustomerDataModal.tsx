

import React, { useState } from 'react';
import { CustomerData } from '../types';

interface CustomerDataModalProps {
  onClose: () => void;
  onSave: (customerData?: CustomerData) => void;
}

const CustomerDataModal: React.FC<CustomerDataModalProps> = ({ onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    // FIX: Changed 'name' to 'customerName' to match the CustomerData type.
    // Also added required `salesCategories` property.
    onSave({
      customerName,
      address,
      email,
      phone,
      salesCategories: [],
    });
  };
  
  const handleSkip = () => {
    onSave(); // No customer data
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF954F] transition-all";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-[#FFFFF5] rounded-lg shadow-xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#532418]">Kundendaten (Optional)</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold" aria-label="Schließen">&times;</button>
        </div>
        <p className="mb-6 text-sm text-gray-600">
            Diese Angaben dienen nur zur Dokumentation Ihrer Einwilligung. Keine Werbung. Keine Weitergabe.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                        Kundenname
                    </label>
                    <input
                        id="customerName"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Straße & PLZ (Optional)
                    </label>
                    <input id="customerAddress" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        E-Mail (Optional)
                    </label>
                    <input id="customerEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses}/>
                </div>
                <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon (Optional)
                    </label>
                    <input id="customerPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses}/>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={handleSkip}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Weiter ohne Kontaktangabe
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-[#FF954F] rounded-md hover:bg-[#CC5200] transition-colors"
                >
                    Speichern & fortfahren
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDataModal;