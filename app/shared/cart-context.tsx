'use client';

import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Sefer } from '../seforim/seforim-catalog';
import type { CartItem } from '../seforim/store-checkout';

type CartContextType = {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (book: Sefer, format: 'book' | 'pdf') => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
};

const defaultCartContext: CartContextType = {
  cart: [],
  cartOpen: false,
  setCartOpen: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalCount: 0,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  let pathname = '';
  try {
    pathname = usePathname() || '';
  } catch (e) {}
  const isAdminPage = Boolean(pathname?.startsWith('/admin') || pathname?.includes('/admin'));

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kav_haribis_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('kav_haribis_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const totalCount = cart.reduce((n, x) => n + x.quantity, 0);

  const subtotal = cart.reduce(
    (sum, x) =>
      sum +
      (x.format === 'pdf' ? x.book.pdf_price : x.book.price) * x.quantity,
    0,
  );

  const addToCart = (book: Sefer, format: 'book' | 'pdf') => {
    setCart((current) => {
      const index = current.findIndex(
        (x) => x.book.id === book.id && x.format === format,
      );
      if (index < 0) return [...current, { book, format, quantity: 1 }];
      return current.map((x, i) =>
        i === index
          ? {
              ...x,
              quantity: format === 'pdf' ? 1 : Math.min(10, x.quantity + 1),
            }
          : x,
      );
    });
    setCartOpen(true); // Open side drawer automatically on Add to Cart!
  };

  const removeFromCart = (index: number) => {
    setCart((current) => current.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, q: number) => {
    setCart((current) =>
      current.map((x, i) => (i === index ? { ...x, quantity: Math.max(1, q) } : x)),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
      }}
    >
      {children}

      {/* Side Slide-Over Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            {/* Clean Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#102a43]">Shopping Cart</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f7f0e1] text-[#8a6828] font-bold text-[11px] inline-block mt-0.5">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center text-sm transition cursor-pointer"
                aria-label="Close cart drawer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#fdfbf7]">
              {cart.length === 0 ? (
                <div className="py-24 text-center space-y-3">
                  <span className="text-5xl block opacity-60">🛒</span>
                  <p className="font-serif text-lg font-bold text-[#102a43]">Your cart is empty</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Explore our Seforim catalog to add printed books or PDF editions.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const unitPrice = item.format === 'pdf' ? item.book.pdf_price : item.book.price;
                  return (
                    <div
                      key={`${item.book.id}-${item.format}`}
                      className="bg-white border border-[#eee8dc] rounded-xl p-3.5 flex gap-3.5 items-center shadow-2xs hover:border-[#c69b46]/50 transition-all"
                    >
                      {/* Thumbnail Container */}
                      <div className="w-16 h-20 bg-slate-50 rounded-lg border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.book.image}
                          alt={item.book.title}
                          className="max-h-full max-w-full object-contain drop-shadow-2xs"
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="font-serif text-sm font-bold text-[#102a43] truncate">
                            {item.book.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <span className="text-[11px] font-semibold text-[#8a6828] bg-[#f7f0e1] px-2 py-0.5 rounded-md inline-block mb-2">
                          {item.format === 'pdf' ? '📄 PDF Download' : '📚 Printed Book'}
                        </span>

                        <div className="flex items-center justify-between">
                          {/* Quantity Selector */}
                          {item.format === 'book' ? (
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                              <button
                                onClick={() => updateQuantity(idx, item.quantity - 1)}
                                className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 text-xs font-bold transition"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold text-[#102a43]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(idx, item.quantity + 1)}
                                className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 text-xs font-bold transition"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Qty: 1</span>
                          )}

                          {/* Price */}
                          <span className="font-bold text-sm text-[#102a43]">
                            ${(unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clean Drawer Footer */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-3 shadow-xl">
              {/* Subtotal */}
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-semibold text-slate-500">Subtotal</span>
                <span className="font-serif font-bold text-2xl text-[#102a43]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Shipping &amp; payment calculated on next step
              </p>

              {/* Continue Shopping Button -> /seforim */}
              <a
                href="/seforim"
                onClick={() => setCartOpen(false)}
                className="w-full text-center py-3 border border-[#102a43]/20 hover:border-[#102a43] text-[#102a43] font-bold rounded-xl text-sm transition block bg-slate-50/50 hover:bg-slate-100"
              >
                Continue Shopping
              </a>

              {/* Proceed to Checkout Button -> /checkout */}
              <a
                href="/checkout"
                style={{color:"white"}}
                onClick={() => setCartOpen(false)}
                className={`w-full text-center py-3.5 bg-yellow-500 hover:bg-[#173f5f] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 block border border-[#c69b46]/30 ${
                  cart.length === 0 ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span>Proceed to Checkout</span>
                <span className="text-base">→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context || defaultCartContext;
}
