import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  ideaTitle: string;
}

const FlagModal: React.FC<FlagModalProps> = ({ isOpen, onClose, onSubmit, ideaTitle }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason) {
      onSubmit(reason, details);
      setReason('');
      setDetails('');
      onClose();
    }
  };

  const flagReasons = [
    'Inappropriate content',
    'Spam or duplicate',
    'Offensive language',
    'Copyright violation',
    'Misleading information',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-800">Flag Idea</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            You're flagging: <span className="font-medium">"{ideaTitle}"</span>
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for flagging *
            </label>
            <div className="space-y-2">
              {flagReasons.map((flagReason) => (
                <label key={flagReason} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={flagReason}
                    checked={reason === flagReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{flagReason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Provide more context about why you're flagging this idea..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Flag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagModal;