import React, { useState } from 'react';
import { X, DollarSign, Heart, CreditCard } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedAmount: number;
  recipientName: string;
  onConfirm: (amount: number) => void;
}

const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  suggestedAmount,
  recipientName,
  onConfirm
}) => {
  const [tipAmount, setTipAmount] = useState(suggestedAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<'suggested' | 'preset' | 'custom'>('suggested');

  if (!isOpen) return null;

  const presetAmounts = [5, 10, 25, 50, 100];

  const handleConfirm = () => {
    let finalAmount = tipAmount;
    
    if (selectedAmount === 'custom' && customAmount) {
      finalAmount = Number(customAmount);
    }
    
    if (finalAmount > 0) {
      onConfirm(finalAmount);
    }
  };

  const handlePresetSelect = (amount: number) => {
    setTipAmount(amount);
    setSelectedAmount('preset');
  };

  const handleCustomSelect = () => {
    setSelectedAmount('custom');
    setCustomAmount(tipAmount.toString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Send a Tip</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1">
            Show appreciation to {recipientName}
          </p>
        </div>

        <div className="p-6">
          {/* Suggested Amount */}
          {suggestedAmount > 0 && (
            <div className="mb-6">
              <button
                onClick={() => {
                  setTipAmount(suggestedAmount);
                  setSelectedAmount('suggested');
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedAmount === 'suggested'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-medium text-gray-800">Suggested Amount</div>
                    <div className="text-sm text-gray-600">Recommended by {recipientName}</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${suggestedAmount}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Preset Amounts */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Quick amounts</h3>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetSelect(amount)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedAmount === 'preset' && tipAmount === amount
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Custom amount</h3>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={selectedAmount === 'custom' ? customAmount : ''}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  handleCustomSelect();
                }}
                onFocus={handleCustomSelect}
                min="1"
                max="1000"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  selectedAmount === 'custom'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 text-sm font-medium">Demo Mode</p>
                <p className="text-blue-700 text-xs">
                  This is a demonstration. No actual payment will be processed.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Skip Tip
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                (selectedAmount === 'custom' && (!customAmount || Number(customAmount) <= 0)) ||
                (selectedAmount !== 'custom' && tipAmount <= 0)
              }
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send ${selectedAmount === 'custom' ? customAmount || '0' : tipAmount} Tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipModal;