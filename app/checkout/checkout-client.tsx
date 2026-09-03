'use client';

import StoreCheckout from '../seforim/store-checkout';
import { useCart } from '../shared/cart-context';

export default function CheckoutClientPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  if (!cart || cart.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <span className="text-6xl block">🛒</span>
        <h2 className="font-serif text-2xl font-bold text-[#102a43]">Your Cart is Empty</h2>
        <p className="text-sm text-slate-600">
          You have no items in your cart. Explore our Seforim &amp; Publications catalog to add printed books or PDF editions.
        </p>
        <a
          href="/seforim"
          style={{color:"white"}}
          className="inline-block bg-[#102a43] hover:bg-[#173f5f] font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-md"
        >
          Browse Seforim Catalog →
        </a>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <StoreCheckout
        items={cart}
        onClose={() => {}}
        onQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
