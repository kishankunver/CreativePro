import React, { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { User } from '../types';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
  ideaTitle?: string;
}

const MessagingModal: React.FC<MessagingModalProps> = ({ 
  isOpen, 
  onClose, 
  recipient, 
  ideaTitle 
}) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState(
    ideaTitle ? `Interested in your idea: ${ideaTitle}` : ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, send the message via API
      alert(`Message sent to ${recipient.name}!`);
      setMessage('');
      setSubject('');
      onClose();
    }
  };

  const suggestedMessages = [
    "Hi! I love your idea. Are you looking for collaborators?",
    "Great concept! I have experience in this area and would love to discuss.",
    "Interesting idea! How far along are you with development?",
    "I'd like to learn more about your idea. Can we connect?"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Message {recipient.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="What's this about?"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write your message..."
              required
            />
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick suggestions:</p>
            <div className="space-y-2">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="w-full text-left text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded border transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
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
              disabled={!message.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessagingModal;