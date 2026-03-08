import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Phone,
  Smartphone,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  PaymentMethod,
  useCart,
  usePlaceOrder,
  useProducts,
  useShopSettings,
} from "../hooks/useQueries";

export default function CheckoutPage() {
  const { navigate } = useApp();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.cashOnDelivery,
  );
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { data: cart } = useCart();
  const { data: products } = useProducts();
  const { data: shopSettings } = useShopSettings();
  const placeOrder = usePlaceOrder();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-muted-foreground mb-4">Please login to checkout</p>
        <Button
          className="gradient-amber border-0 text-primary-foreground"
          onClick={() => navigate("home")}
        >
          Go Home
        </Button>
      </div>
    );
  }

  const cartWithProducts =
    cart?.map((item) => ({
      ...item,
      product: products?.find((p) => p.id === item.productId),
    })) ?? [];

  const subtotal = cartWithProducts.reduce((sum, item) => {
    const price = item.product ? Number(item.product.price) : 0;
    return sum + price * Number(item.quantity);
  }, 0);

  const shippingAmount = shopSettings ? Number(shopSettings.shippingAmount) : 0;
  const gstEnabled = shopSettings?.gstEnabled ?? false;
  const gstPercent = shopSettings ? Number(shopSettings.gstPercent) : 18;
  const gstAmount = gstEnabled ? Math.round((subtotal * gstPercent) / 100) : 0;
  const total = subtotal + shippingAmount + gstAmount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    try {
      await placeOrder.mutateAsync({
        deliveryAddress: address.trim(),
        phoneNumber: phone.trim(),
        paymentMethod,
      });
      setOrderPlaced(true);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <AnimatePresence mode="wait">
        {orderPlaced ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 space-y-6"
            data-ocid="checkout.success_state"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
              className="h-24 w-24 rounded-full gradient-amber flex items-center justify-center mx-auto shadow-amber"
            >
              <CheckCircle2 className="h-12 w-12 text-white" />
            </motion.div>
            <div>
              <h2 className="font-display font-extrabold text-3xl text-foreground mb-2">
                Order Placed! 🎉
              </h2>
              <p className="text-muted-foreground text-lg">
                Your books and uniforms are on their way!
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card text-left max-w-sm mx-auto border border-border/50 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Delivery Address
                  </p>
                  <p className="text-sm text-muted-foreground">{address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {paymentMethod === PaymentMethod.cashOnDelivery ? (
                  <Banknote className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethod === PaymentMethod.cashOnDelivery
                      ? "Cash on Delivery"
                      : "UPI on Delivery"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                className="gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2"
                onClick={() => navigate("orders")}
              >
                <Package className="h-4 w-4" />
                Track Order
              </Button>
              <Button variant="outline" onClick={() => navigate("products")}>
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("cart")}
              className="mb-6 gap-2 text-muted-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>

            <h1 className="font-display font-extrabold text-3xl text-foreground mb-8">
              Checkout
            </h1>

            <div className="grid md:grid-cols-5 gap-8">
              {/* Form */}
              <div className="md:col-span-3">
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                    <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delivery Address
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-sm font-semibold"
                        >
                          Full Address
                        </Label>
                        <Textarea
                          id="address"
                          placeholder="Enter your complete delivery address including flat/house number, street, city, state, and PIN code..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={4}
                          className="resize-none rounded-xl"
                          data-ocid="checkout.address_textarea"
                        />
                        <p className="text-xs text-muted-foreground">
                          Please include your full address for smooth delivery
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-semibold flex items-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="rounded-xl"
                          data-ocid="checkout.phone_input"
                        />
                        <p className="text-xs text-muted-foreground">
                          We'll contact you on this number for delivery updates
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                    <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-primary" />
                      Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Cash on Delivery */}
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentMethod(PaymentMethod.cashOnDelivery)
                        }
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          paymentMethod === PaymentMethod.cashOnDelivery
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                        }`}
                        data-ocid="checkout.payment.cod_toggle"
                      >
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === PaymentMethod.cashOnDelivery
                              ? "gradient-amber"
                              : "bg-muted"
                          }`}
                        >
                          <Banknote
                            className={`h-5 w-5 ${paymentMethod === PaymentMethod.cashOnDelivery ? "text-white" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Cash on Delivery
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Pay cash when your order arrives
                          </p>
                        </div>
                        {paymentMethod === PaymentMethod.cashOnDelivery && (
                          <div className="ml-auto">
                            <div className="h-5 w-5 rounded-full gradient-amber flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>

                      {/* UPI on Delivery */}
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentMethod(PaymentMethod.upiOnDelivery)
                        }
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          paymentMethod === PaymentMethod.upiOnDelivery
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                        }`}
                        data-ocid="checkout.payment.upi_toggle"
                      >
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === PaymentMethod.upiOnDelivery
                              ? "gradient-amber"
                              : "bg-muted"
                          }`}
                        >
                          <Smartphone
                            className={`h-5 w-5 ${paymentMethod === PaymentMethod.upiOnDelivery ? "text-white" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            UPI on Delivery
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Scan & pay via UPI when order arrives
                          </p>
                        </div>
                        {paymentMethod === PaymentMethod.upiOnDelivery && (
                          <div className="ml-auto">
                            <div className="h-5 w-5 rounded-full gradient-amber flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2"
                    disabled={
                      !address.trim() ||
                      !phone.trim() ||
                      placeOrder.isPending ||
                      !cart?.length
                    }
                    data-ocid="checkout.place_order_button"
                  >
                    {placeOrder.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Placing
                        Order...
                      </>
                    ) : (
                      <>
                        <Package className="h-5 w-5" /> Place Order
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Order summary */}
              <div className="md:col-span-2">
                <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 sticky top-24">
                  <h2 className="font-display font-bold text-lg mb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cartWithProducts.map((item) => (
                      <div
                        key={item.productId.toString()}
                        className="flex items-start gap-3"
                      >
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.product?.image ? (
                            <img
                              src={item.product.image.getDirectURL()}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold line-clamp-1">
                            {item.product?.name ?? `Product #${item.productId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {Number(item.quantity)}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          ₹
                          {item.product
                            ? Number(item.product.price) * Number(item.quantity)
                            : 0}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="mb-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground">
                        ₹{subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span
                        className={`font-semibold ${shippingAmount === 0 ? "text-success" : "text-foreground"}`}
                      >
                        {shippingAmount === 0 ? "FREE" : `₹${shippingAmount}`}
                      </span>
                    </div>
                    {gstEnabled && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>GST ({gstPercent}%)</span>
                        <span className="font-semibold text-foreground">
                          ₹{gstAmount}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-display font-extrabold text-lg pt-1">
                      <span>Total</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
