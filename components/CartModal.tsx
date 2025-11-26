import React, { useState, useEffect } from 'react';
import { MenuItem, CartItems } from '../types';
import { api } from '../services/api';
import PrintService from './PrintService';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItems;
  itemsMap: Map<string, MenuItem>;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  onUpdateQuantity: (item: MenuItem, quantity: number) => void;
  onClear: () => void;
  tableId: string;
  locationLabel: string;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cart, itemsMap, onAdd, onRemove, onUpdateQuantity, onClear, tableId, locationLabel }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null); // 添加提交错误状态

  // Reset confirmation state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setEditingId(null);
      setIsSubmitting(false);
      setSubmitError(null); // 重置错误状态
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cartItemIds = Object.keys(cart);
  
  const subtotal = cartItemIds.reduce((sum, id) => {
    const item = itemsMap.get(id);
    return sum + (item ? item.price * cart[id] : 0);
  }, 0);

  // PH Standard: 10% Service Charge
  const serviceCharge = Math.round(subtotal * 0.10);
  const grandTotal = subtotal + serviceCharge;

  const handlePlaceOrder = () => {
    if (cartItemIds.length > 0) {
      setShowConfirmation(true);
    }
  };

  const confirmOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null); // 清除之前的错误
    try {
      // Prepare Payload
      const itemsPayload = cartItemIds.map(id => ({
        dishId: id,
        quantity: cart[id]
      }));

      const payload = {
        tableId: tableId, // Send technical ID to backend (RM-808)
        items: itemsPayload,
        totalAmount: grandTotal
      };

      const response = await api.submitOrder(payload);
      
      if (response.code === 200) {
        alert(`下单成功！Order Placed Successfully!

Location: ${locationLabel}
Order ID: ${response.data.orderId}

Salamat po!`);
        onClear();
        onClose();
        setShowConfirmation(false);
      } else {
        setSubmitError('下单失败，请重试。\nFailed to place order.');
      }
    } catch (e) {
      console.error(e);
      setSubmitError('网络错误，请重试。\nNetwork Error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (id: string, qty: number) => {
    setEditingId(id);
    setEditValue(qty.toString());
  };

  const saveEditing = (id: string) => {
    const item = itemsMap.get(id);
    if (item) {
        const newQty = parseInt(editValue, 10);
        if (!isNaN(newQty) && newQty >= 0) {
            onUpdateQuantity(item, newQty);
        }
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEditing(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-paper w-full max-w-lg rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-wood text-stone-light flex justify-between items-center shadow-md">
            <div>
                <h2 className="text-lg font-bold tracking-widest">当前订单</h2>
                <p className="text-xs text-stone-400">Shopping Cart</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gold px-2 py-0.5 border border-gold/30 rounded font-bold truncate max-w-[150px]">{locationLabel}</span>
                <button onClick={onClear} className="text-xs text-stone-400 hover:text-white underline underline-offset-2 ml-2">
                    清空 Empty
                </button>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 text-red-700">
            <p>{submitError}</p>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItemIds.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
               <p className="mb-2">购物车是空的</p>
               <p className="text-xs uppercase">Your cart is empty</p>
            </div>
          ) : (
            cartItemIds.map(id => {
              const item = itemsMap.get(id);
              if (!item) return null;
              return (
                <div key={id} className="flex justify-between items-center border-b border-stone-200 pb-3 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-bold text-ink">{item.zh}</h4>
                    <p className="text-xs text-stone-500">{item.en}</p>
                    <div className="text-cinnabar text-sm mt-1">
                        {item.price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-100 rounded-full px-2 py-1">
                    <button onClick={() => onRemove(item)} className="w-6 h-6 flex items-center justify-center text-stone-600 font-bold active:text-wood">-</button>
                    
                    {editingId === id ? (
                        <input 
                            type="number"
                            className="w-10 text-center font-bold text-ink bg-white border border-stone-300 rounded px-1 py-0 text-sm focus:outline-none focus:border-gold"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            onBlur={() => saveEditing(id)}
                            onKeyDown={(e) => handleKeyDown(e, id)}
                        />
                    ) : (
                        <span 
                            className="w-8 text-center font-bold text-ink cursor-text hover:bg-stone-200 rounded px-1 transition-colors"
                            onClick={() => startEditing(id, cart[id])}
                            title="Click to edit"
                        >
                            {cart[id]}
                        </span>
                    )}
                    
                    <button onClick={() => onAdd(item)} className="w-6 h-6 flex items-center justify-center text-stone-600 font-bold active:text-wood">+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2">
          <div className="flex justify-between items-center text-stone-500 text-sm">
            <span>小计 Subtotal:</span>
            <span className="font-medium">
                {subtotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
            </span>
          </div>
          <div className="flex justify-between items-center text-stone-500 text-sm">
            <span>服务费 Service Charge (10%):</span>
            <span className="font-medium">
                {serviceCharge.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
            </span>
          </div>
          <div className="flex justify-between items-end pt-2 border-t border-stone-200 mt-2 mb-4">
            <span className="text-ink font-bold font-serif">总计 Total:</span>
            <span className="text-2xl font-bold text-cinnabar">
               {grandTotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
            </span>
          </div>
          <PrintService 
            cart={cart}
            itemsMap={itemsMap}
            locationLabel={locationLabel}
          />
          
          <button 
            className={`w-full py-3 rounded-sm font-bold tracking-widest text-lg shadow-md transition-all ${cartItemIds.length > 0 ? 'bg-wood text-gold hover:bg-black' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
            disabled={cartItemIds.length === 0}
            onClick={handlePlaceOrder}
          >
            确认下单 Place Order
          </button>
        </div>

        {/* Confirmation Overlay */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-paper/95 z-20 flex flex-col items-center justify-center p-6 animate-fade-in">
             <div className="text-center space-y-4 mb-8 max-w-xs">
                <div className="w-16 h-16 bg-stone-100 rounded-full mx-auto flex items-center justify-center text-gold mb-4 border border-stone-200">
                    {isSubmitting ? (
                        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-ink">
                   {isSubmitting ? '正在提交...' : '确认下单?'}
                </h3>
                
                {!isSubmitting && (
                    <div className="bg-stone-100 p-2 rounded border border-stone-200">
                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Delivering to</p>
                        <p className="text-lg font-bold text-cinnabar">{locationLabel}</p>
                    </div>
                )}

                <p className="text-stone-500 text-sm">
                    {isSubmitting ? 'Processing your order...' : '请确认您的订单内容无误。\nPlease confirm your order.'}
                </p>
                
                {!isSubmitting && (
                    <div className="text-3xl font-bold text-cinnabar mt-2 font-serif">
                       {grandTotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                    </div>
                )}
             </div>
             {!isSubmitting && (
                 <div className="flex w-full gap-4 max-w-xs">
                    <button 
                        onClick={() => setShowConfirmation(false)}
                        className="flex-1 py-3 border border-stone-300 text-stone-600 rounded-sm font-bold hover:bg-stone-100 transition-colors"
                    >
                        取消 Cancel
                    </button>
                    <button 
                        onClick={confirmOrder}
                        className="flex-1 py-3 bg-wood text-gold rounded-sm font-bold shadow-md hover:bg-black transition-colors"
                    >
                        确认 Confirm
                    </button>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;