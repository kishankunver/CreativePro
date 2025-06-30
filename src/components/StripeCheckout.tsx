import React, { useState } from 'react';
import { Heart, Loader } from 'lucide-react';
import { stripeProducts } from '../stripe-config';
import { useAuth } from '../contexts/AuthContext';

interface StripeCheckoutProps {
  className?: string;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      setError('Please log in to make a purchase');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Support the Community</h3>
        <p className="text-gray-600">
          Help keep CreativePro running and support contributors who share amazing ideas
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {stripeProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">{product.name}</h4>
              <span className="text-sm text-gray-500 capitalize">
                {product.mode === 'payment' ? 'One-time' : 'Subscription'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            
            <button
              onClick={() => handleCheckout(product.priceId, product.mode)}
              disabled={isLoading || !user}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  <span>{product.name}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {!user && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm text-center">
            Please log in to support the community
          </p>
        </div>
      )}
    </div>
  );
};

export default StripeCheckout;