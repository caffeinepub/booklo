import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useApp } from "../App";
import { useShopSettings } from "../hooks/useQueries";
import { ProductCategory } from "../hooks/useQueries";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, navigate } = useApp();
  const { data: settings } = useShopSettings();

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
      <div
        className="max-w-4xl mx-auto px-4 py-16 text-center"
        data-ocid="cart.empty_state"
      >
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some books or uniforms to get started.
        </p>
        <Button
          data-ocid="cart.primary_button"
          onClick={() => navigate("home")}
          className="bg-primary text-primary-foreground"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => (
            <Card
              key={item.product.id.toString()}
              data-ocid={`cart.item.${idx + 1}`}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold truncate">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₹{Number(item.product.price)} each
                  </p>
                  {(item.product.category === ProductCategory.privateBooks ||
                    item.product.category === "privateBooks") && (
                    <span className="text-xs text-accent font-medium">
                      10% discount applied
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    data-ocid={`cart.secondary_button.${idx + 1}`}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    data-ocid={`cart.primary_button.${idx + 1}`}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="font-bold">
                    ₹{Number(item.product.price) * item.quantity}
                  </p>
                </div>
                <Button
                  data-ocid={`cart.delete_button.${idx + 1}`}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-display">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {privateDiscount > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Private Books Discount (10%)</span>
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
              data-ocid="cart.submit_button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("checkout")}
            >
              Proceed to Checkout
            </Button>
            <Button
              data-ocid="cart.secondary_button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("home")}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
