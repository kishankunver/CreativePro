export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SayFWwCRf6Ce7m',
    priceId: 'price_1RfmIf4bhXyCsmiXPuZ9g1FX',
    name: '❤️ Tip This Contributor',
    description: 'Your support encourages more original ideas and contributions. Thanks for keeping the community inspired!',
    mode: 'payment'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};