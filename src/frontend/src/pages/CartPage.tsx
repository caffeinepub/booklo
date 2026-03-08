import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToCart,
  useCart,
  useClearCart,
  useProducts,
} from "../hooks/useQueries";

export default function CartPage() {
  const { navigate } = useApp();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: products } = useProducts();
  const addToCart = useAddToCart();
  const clearCart = useClearCart();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="font-display font-bold text-2xl mb-2">Your Cart</h2>
        <p className="text-muted-foreground mb-6">
          Please login to view your cart
        </p>
        <Button
          className="gradient-amber border-0 text-primary-foreground shadow-amber font-semibold"
          onClick={() => navigate("home")}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  const getProductInfo = (productId: bigint) => {
    return products?.find((p) => p.id === productId);
  };

  const cartWithProducts =
    cart?.map((item) => ({
      ...item,
      product: getProductInfo(item.productId),
    })) ?? [];

  const subtotal = cartWithProducts.reduce((sum, item) => {
    const price = item.product ? Number(item.product.price) : 0;
    return sum + price * Number(item.quantity);
  }, 0);

  const handleUpdateQuantity = async (productId: bigint, newQty: number) => {
    if (newQty <= 0) {
      // Remove by setting qty to 0 — we do clearCart + re-add approach if needed
      // For simplicity, just clear and re-add all
      toast.error("To remove an item, use the cart clear function");
      return;
    }
    try {
      await addToCart.mutateAsync({ productId, quantity: BigInt(newQty) });
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }, (_, i) => i).map((i) => (
          <Skeleton
            key={`cart-skeleton-${i}`}
            className="h-24 w-full rounded-xl"
            data-ocid="cart.loading_state"
          />
        ))}
      </div>
    );
  }

  const isEmpty = !cart || cart.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-foreground">
              Your Cart
            </h1>
            <p className="text-muted-foreground mt-1">
              {cart?.length ?? 0} {cart?.length === 1 ? "item" : "items"}
            </p>
          </div>
          {!isEmpty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              disabled={clearCart.isPending}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              data-ocid="cart.clear_button"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
            data-ocid="cart.empty_state"
          >
            <div className="h-24 w-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Browse our collection of books and school uniforms
            </p>
            <Button
              size="lg"
              className="gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2"
              onClick={() => navigate("products")}
            >
              <Package className="h-5 w-5" />
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Cart items */}
            <AnimatePresence mode="popLayout">
              {cartWithProducts.map((item, i) => {
                const product = item.product;
                const itemTotal = product
                  ? Number(product.price) * Number(item.quantity)
                  : 0;
                const staticImages: Record<string, string> = {
                  "Harry Potter and the Philosopher's Stone":
                    "/assets/generated/book-harry-potter.dim_400x400.jpg",
                  "The Alchemist":
                    "/assets/generated/book-alchemist.dim_400x400.jpg",
                  "NCERT Mathematics Class 10":
                    "/assets/generated/book-ncert-math.dim_400x400.jpg",
                  "School Shirt (White, Sizes S-XL)":
                    "/assets/generated/uniform-shirt.dim_400x400.jpg",
                  "School Trousers (Grey, Sizes 26-36)":
                    "/assets/generated/uniform-trousers.dim_400x400.jpg",
                  "School Tie (House Colors)":
                    "/assets/generated/uniform-tie.dim_400x400.jpg",
                };
                const imageUrl = product?.image
                  ? product.image.getDirectURL()
                  : product?.name
                    ? staticImages[product.name]
                    : null;

                return (
                  <motion.div
                    key={item.productId.toString()}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4 border border-border/50"
                    data-ocid={`cart.item.${i + 1}`}
                  >
                    {/* Image */}
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product?.name ?? "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm leading-tight line-clamp-2 text-card-foreground">
                        {product?.name ?? `Product #${item.productId}`}
                      </h3>
                      <p className="text-primary font-extrabold mt-1">
                        ₹{product ? Number(product.price) : 0}
                      </p>
                    </div>

                    {/* Quantity + total */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                          type="button"
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-40"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              Number(item.quantity) - 1,
                            )
                          }
                          disabled={
                            Number(item.quantity) <= 1 || addToCart.isPending
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-bold text-sm w-8 text-center">
                          {Number(item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              Number(item.quantity) + 1,
                            )
                          }
                          disabled={addToCart.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        ₹{itemTotal}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
            >
              <h3 className="font-display font-bold text-lg mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold text-foreground">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-success">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between font-display font-bold text-lg pt-1">
                  <span>Total</span>
                  <span className="text-primary">₹{subtotal}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full mt-5 gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2"
                onClick={() => navigate("checkout")}
                data-ocid="cart.checkout_button"
              >
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
