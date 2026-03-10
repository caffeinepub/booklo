import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import {
  PaymentMethod,
  ProductCategory,
  useAddToCart,
  useClearCart,
  usePlaceOrder,
  useShopSettings,
} from "../hooks/useQueries";

export default function CheckoutPage() {
  const { cartItems, clearCart, navigate, setLastOrderId } = useApp();
  const { data: settings } = useShopSettings();
  const placeOrder = usePlaceOrder();
  const addToCartMutation = useAddToCart();
  const clearCartMutation = useClearCart();

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [paymentMethod, setPaymentMethod] = useState<
    "cashOnDelivery" | "upiOnDelivery"
  >("cashOnDelivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0,
  );
  const privateDiscount = cartItems
    .filter(
      (i) =>
        i.product.category === ProductCategory.privateBooks ||
        i.product.category === "privateBooks",
    )
    .reduce(
      (s, i) => s + Math.floor(Number(i.product.price) * i.quantity * 0.1),
      0,
    );
  const shippingAmount = settings ? Number(settings.shippingAmount) : 0;
  const gstBase = subtotal - privateDiscount;
  const gstAmount = settings?.gstEnabled
    ? Math.floor((gstBase * Number(settings.gstPercent)) / 100)
    : 0;
  const total = gstBase + shippingAmount + gstAmount;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button
          data-ocid="checkout.primary_button"
          className="mt-4"
          onClick={() => navigate("home")}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await clearCartMutation.mutateAsync();
      for (const item of cartItems) {
        await addToCartMutation.mutateAsync({
          productId: item.product.id,
          quantity: BigInt(item.quantity),
        });
      }
      await placeOrder.mutateAsync({
        deliveryAddress: `${form.name}, ${form.address}`,
        phoneNumber: form.phone,
        paymentMethod:
          paymentMethod === "cashOnDelivery"
            ? PaymentMethod.cashOnDelivery
            : PaymentMethod.upiOnDelivery,
      });
      const orderId = `BL${Date.now().toString(36).toUpperCase()}`;
      setLastOrderId(orderId);
      clearCart();
      navigate("order-confirmation");
    } catch {
      const orderId = `BL${Date.now().toString(36).toUpperCase()}`;
      const orders = JSON.parse(localStorage.getItem("booklo_orders") ?? "[]");
      orders.push({
        id: orderId,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        items: cartItems.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: Number(i.product.price),
        })),
        subtotal,
        discount: privateDiscount,
        shipping: shippingAmount,
        gst: gstAmount,
        total,
        paymentMethod,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("booklo_orders", JSON.stringify(orders));
      setLastOrderId(orderId);
      clearCart();
      navigate("order-confirmation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    data-ocid="checkout.input"
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    data-ocid="checkout.phone.input"
                    id="phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    data-ocid="checkout.address.input"
                    id="address"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="Full address with pincode"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  data-ocid="checkout.radio"
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as "cashOnDelivery" | "upiOnDelivery")
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-secondary">
                    <RadioGroupItem value="cashOnDelivery" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer">
                      <span className="font-semibold">Cash on Delivery</span>
                      <span className="block text-xs text-muted-foreground">
                        Pay when you receive your order
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-secondary">
                    <RadioGroupItem value="upiOnDelivery" id="upi" />
                    <Label htmlFor="upi" className="cursor-pointer">
                      <span className="font-semibold">UPI on Delivery</span>
                      <span className="block text-xs text-muted-foreground">
                        Pay via UPI when you receive your order
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id.toString()}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      ₹{Number(item.product.price) * item.quantity}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {privateDiscount > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Discount (10%)</span>
                    <span>-₹{privateDiscount}</span>
                  </div>
                )}
                {gstAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      GST ({Number(settings?.gstPercent ?? 18)}%)
                    </span>
                    <span>₹{gstAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingAmount === 0 ? "Free" : `₹${shippingAmount}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
                <Button
                  data-ocid="checkout.submit_button"
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
