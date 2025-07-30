'use client'

import { useState } from 'react';
import Image from 'next/image';
import { useCart, CartItem } from '@/app/contexts/CartContext';
import { usePayment } from '@/app/contexts/PaymentContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

// The CartItemRow now uses the new updateItemQuantity function
function CartItemRow({ item, onUpdateQuantity, onRemove }: { item: CartItem; onUpdateQuantity: (id: number, quantity: number) => void; onRemove: (id: number) => void; }) {
    
    const handleRemoveClick = () => {
        if (window.confirm('This will remove the item from your cart. Are you sure?')) {
            onRemove(item.collectibleId);
        }
    };

    const increment = () => onUpdateQuantity(item.collectibleId, item.quantity + 1);
    const decrement = () => onUpdateQuantity(item.collectibleId, item.quantity - 1);

    return (
        <div className="flex items-start justify-between gap-4 mb-4 border-b pb-4">
            <div className="flex items-start gap-4">
                <div className="relative mt-2 mr-2">
                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md" />
                    {item.quantity > 1 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{item.quantity}</span>
                    )}
                </div>
                <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-muted-foreground text-sm">{item.quantity} x €{item.price.toFixed(2)}</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                    {/* The Fix: The quantity selector is now always visible. */}
                    <div className="flex items-center gap-1 border rounded-md p-1">
                        <button onClick={decrement} className="hover:bg-muted rounded-sm"><ChevronLeft size={14} /></button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={increment} className="hover:bg-muted rounded-sm"><ChevronRight size={14} /></button>
                    </div>
                    <button onClick={handleRemoveClick} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
            </div>
        </div>
    );
}

export default function CartModal() {
  const { isOpen, closeCart, cartItems, clearCart, itemCount, updateItemQuantity } = useCart();
  const { openPayment } = usePayment();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleClearCart = () => {
    clearCart();
    setShowConfirm(false);
  };
  
  // The "Remove" button will now call this function to set the quantity to 0
  const handleRemoveItem = (collectibleId: number) => {
      updateItemQuantity(collectibleId, 0);
  };

  const handleCheckout = () => {
    closeCart();
    openPayment();
  };
  
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <Card className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <button onClick={closeCart} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-6 w-6" /></button>
        <div className="flex items-center gap-4 mb-6">
            <ShoppingCart className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Your Shopping Cart ({itemCount})</h2>
        </div>
        {itemCount > 0 ? (
          <>
            <div className="max-h-96 overflow-y-auto pr-4 -mr-4 mb-4">
                {cartItems.map(item => (<CartItemRow key={item.collectibleId} item={item} onUpdateQuantity={updateItemQuantity} onRemove={handleRemoveItem} />))}
            </div>
            <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg mb-4">
                    <span>Total:</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                </div>
                {showConfirm ? (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 text-center">
                        <p className="text-destructive-foreground mb-4">Are you sure you want to remove all items from your cart?</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="destructive" onClick={handleClearCart}>Yes, Clear Cart</Button>
                            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center gap-4">
                        <Button variant="outline" onClick={() => setShowConfirm(true)}>Clear Shopping Cart</Button>
                        <Button className="flex-grow" onClick={handleCheckout}>Checkout</Button>
                    </div>
                )}
            </div>
          </>
        ) : (
          <div className="text-center py-12"><p className="text-muted-foreground">Your cart is empty.</p></div>
        )}
      </Card>
    </div>
  );
}
