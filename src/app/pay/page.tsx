'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image  from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { addToast } from '@heroui/react';
import { useSession } from '@/components/SessionProvider';

const formatTHB = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export default function Page() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, token, checkTokenExpiration, logout } = useSession();
  const [method, setMethod] = useState<'card' | 'promptpay' | 'linepay'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);


  const { subTotal, vat7, grandTotal } = useMemo(() => {
    return {
      subTotal: cart.subtotal,
      vat7: cart.vat,
      grandTotal: cart.grandTotal,
    };
  }, [cart]);

  // Show empty cart message if cart is empty
  if (cart.items.length === 0) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/bg_hotel.png)' }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-white/80 mb-6">Add some delicious items to your cart before proceeding to payment.</p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      addToast({
        title: "กรุณาเข้าสู่ระบบก่อน",
        description: "Please login before placing an order",
        color: "warning",
      });
      router.push('/login');
      return;
    }

    // Check if token is expired
    if (checkTokenExpiration()) {
      addToast({
        title: "เซสชันหมดอายุ",
        description: "Your session has expired. Please login again.",
        color: "warning",
      });
      router.push('/login');
      return;
    }
    
    if (method === 'card' && (!cardNumber || !exp || !cvv)) {
      addToast({
        title: "กรอกข้อมูลบัตรให้ครบก่อนนะ",
        description: "Please fill in all card information",
        color: "warning",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/protected/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token || ''}` },
        body: JSON.stringify({
          items: cart.items,
          totals: { subTotal, vat7, grandTotal },
          room: 495,
        }),
      });
      const data = await res.json();
      
      // Check for account expiration error
      if (data?.error === "Account expired") {
        addToast({
          title: "บัญชีหมดอายุ",
          description: "Your account has expired. Please contact support or login again.",
          color: "warning",
        });
        // Logout user and redirect to login
        logout();
        router.push('/login');
        return;
      }
      
      if (!res.ok) throw new Error(String(res.status));
      
      if (data?.ok) {
        addToast({
          title: "สั่งอาหารสำเร็จ! 🎉",
          description: `Order ${data.order?.id} has been created successfully.`,
          color: "success",
        });
        clearCart(); // Clear cart after successful order
        setCardNumber(''); setExp(''); setCvv('');
        router.push('/orders'); // Redirect to orders after successful order
      } else {
        addToast({
          title: "สั่งอาหารไม่สำเร็จ",
          description: "Order creation failed. Please try again.",
          color: "danger",
        });
      }
    } catch (err) {
      console.error(err);
      
      // Check if the error is related to account expiration
      if (err instanceof Error && err.message.includes('401')) {
        addToast({
          title: "บัญชีหมดอายุ",
          description: "Your account has expired. Please login again.",
          color: "warning",
        });
        logout();
        router.push('/login');
        return;
      }
      
      addToast({
        title: "สั่งอาหารไม่สำเร็จ ลองอีกครั้ง",
        description: "Order creation failed. Please try again later.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div
      className="min-h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/bg_hotel.png)' }}  // ใส่ไฟล์นี้ใน /public
    >
      <div className="absolute inset-0 bg-black/40" />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-sm tracking-widest text-amber-200">TERRATECH</div>
            <div className="text-white text-lg font-semibold">Payment</div>
            <div className="text-white/70 text-sm mt-1">
              {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} in cart
            </div>
          </div>

          {/* รายการอาหาร */}
          <div className="rounded-xl bg-white/10 border border-white/20 p-4 text-white">
            <div className="grid grid-cols-3 text-sm text-white/80 px-2">
              <div>เมนู</div>
              <div className="text-center">จำนวน</div>
              <div className="text-right">ยอดย่อย</div>
            </div>
            <div className="mt-2 space-y-2">
              {cart.items.map((item, idx) => {
                // Create unique cart item ID for this specific item with its note
                const cartItemId = item.note ? `${item.id}_${item.note}` : item.id;
                
                return (
                  <div key={cartItemId} className="rounded-lg bg-white/5 px-2 py-2">
                    <div className="grid grid-cols-3 items-center">
                      <div className="truncate">{item.name}</div>
                      <div className="text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateQuantity(cartItemId, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItemId, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">{formatTHB(item.quantity * item.price).replace('฿', '')}</div>
                    </div>
                    {item.note && (
                      <div className="mt-1 text-xs text-white/70 italic">
                        Note: {item.note}
                      </div>
                    )}
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => removeFromCart(cartItemId)}
                        className="text-red-300 hover:text-red-200 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-1 text-sm">
              <Row label="ราคาอาหาร (รวม VAT)" value={cart.subtotal + vat7} />
              <Row label="ภาษี 7% (รวมในราคา)" value={vat7} />
              <div className="text-xs text-white/60 mt-2 px-2">
                * ราคาอาหารรวมภาษีมูลค่าเพิ่ม 7% เรียบร้อยแล้ว
              </div>
              <div className="border-t border-white/20 pt-2 mt-2 grid grid-cols-2">
                <div className="font-semibold">ชำระทั้งหมด</div>
                <div className="text-right font-bold text-amber-200">
                  {formatTHB(grandTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* วิธีชำระเงิน */}
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="text-white font-semibold mb-2">Credit/Debit Card</div>

            {/* tabs เลือกวิธีจ่าย */}
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`px-3 py-1 rounded-full text-sm ${
                  method === 'card'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                บัตรเครดิต/เดบิต
              </button>
              <button
                type="button"
                onClick={() => setMethod('promptpay')}
                className={`px-3 py-1 rounded-full text-sm ${
                  method === 'promptpay'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                PromptPay
              </button>
              <button
                type="button"
                onClick={() => setMethod('linepay')}
                className={`px-3 py-1 rounded-full text-sm ${
                  method === 'linepay'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                LINE Pay
              </button>
            </div>

            {method === 'card' ? (
              <div className="space-y-3">
                <input
                  placeholder="Card Number"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim()
                    )
                  }
                  className="w-full rounded-lg bg-white/90 px-3 py-2 outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM/YY"
                    value={exp}
                    onChange={(e) =>
                      setExp(
                        e.target.value
                          .replace(/[^\d]/g, '')
                          .slice(0, 4)
                          .replace(/(^\d{2})(\d{0,2})/, (_m, a, b) => (b ? `${a}/${b}` : a))
                      )
                    }
                    className="rounded-lg bg-white/90 px-3 py-2 outline-none"
                  />
                  <input
                    placeholder="CVV"
                    inputMode="numeric"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                    className="rounded-lg bg-white/90 px-3 py-2 outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-white/90">
                <Image src="/payment/promptpay.png" alt="PromptPay" className="h-8 w-auto" width={32} height={32} />
                <Image src="/payment/linepay.png" alt="LINE Pay" className="h-8 w-auto" width={32} height={32} />
                <span className="text-sm">เลือก {method === 'promptpay' ? 'PromptPay' : 'LINE Pay'}</span>
              </div>
            )}

            <div className="mt-4 text-center text-white/80 text-sm">Room 495</div>

            <div className="mt-4 grid gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-amber-300 hover:bg-amber-200 active:scale-[.99] py-3 font-semibold shadow disabled:opacity-60"
              >
                {loading ? 'กำลังชำระเงิน…' : 'Confirm Payment'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/menu')}
                className="text-white/70 hover:text-white text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-2">
      <div className="text-white/80">{label}</div>
      <div className="text-right text-white/90">{formatTHB(value).replace('฿', '')}</div>
    </div>
  );
}
