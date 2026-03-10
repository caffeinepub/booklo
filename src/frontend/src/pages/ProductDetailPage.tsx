import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Check,
  GraduationCap,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart, useProduct } from "../hooks/useQueries";
import { ProductCategory } from "../hooks/useQueries";

interface ProductDetailPageProps {
  productId: bigint;
}

export default function ProductDetailPage({
  productId,
}: ProductDetailPageProps) {
  const { navigate } = useApp();
  const { data: product, isLoading } = useProduct(productId);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product?.stock === 0n;
  const isBook = product?.category === ProductCategory.books;
  const maxQty = product ? Math.min(Number(product.stock), 10) : 10;

  const staticImages: Record<string, string> = {
    "Harry Potter and the Philosopher's Stone":
      "/assets/generated/book-harry-potter.dim_400x400.jpg",
    "The Alchemist": "/assets/generated/book-alchemist.dim_400x400.jpg",
    "NCERT Mathematics Class 10":
      "/assets/generated/book-ncert-math.dim_400x400.jpg",
    "School Shirt (White, Sizes S-XL)":
      "/assets/generated/uniform-shirt.dim_400x400.jpg",
    "School Trousers (Grey, Sizes 26-36)":
      "/assets/generated/uniform-trousers.dim_400x400.jpg",
    "School Tie (House Colors)":
      "/assets/generated/uniform-tie.dim_400x400.jpg",
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    if (!product || isOutOfStock) return;
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      setJustAdded(true);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="h-80 md:h-96 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-muted-foreground font-display text-lg">
          Product not found
        </p>
        <Button
          className="mt-4 gradient-amber border-0 text-primary-foreground"
          onClick={() => navigate("products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  const imageUrl = product.image
    ? product.image.getDirectURL()
    : staticImages[product.name] || null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("products")}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8 lg:gap-12"
      >
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square md:aspect-auto md:h-96 shadow-card">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isBook ? (
                <BookOpen className="h-24 w-24 text-muted-foreground/20" />
              ) : (
                <GraduationCap className="h-24 w-24 text-muted-foreground/20" />
              )}
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-6 py-2">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Badge
              className={`mb-3 border-0 ${
                isBook
                  ? "bg-secondary text-secondary-foreground"
                  : "gradient-amber text-primary-foreground"
              }`}
            >
              {isBook ? (
                <>
                  <BookOpen className="h-3 w-3 mr-1" /> Book
                </>
              ) : (
                <>
                  <GraduationCap className="h-3 w-3 mr-1" /> School Uniform
                </>
              )}
            </Badge>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating placeholder */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className="h-4 w-4 text-primary fill-primary" />
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              (128 reviews)
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description.split("\n\n__META__")[0]}
          </p>

          <div className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-4xl text-primary">
              ₹{Number(product.price)}
            </span>
            <span className="text-muted-foreground text-sm line-through">
              ₹{Math.round(Number(product.price) * 1.2)}
            </span>
            <Badge className="gradient-amber border-0 text-primary-foreground text-xs">
              20% OFF
            </Badge>
          </div>

          <div className="bg-accent rounded-xl p-4 flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                Free delivery
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated delivery in 30-60 minutes
              </p>
            </div>
          </div>

          {/* Stock info */}
          {!isOutOfStock && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {Number(product.stock)}
              </span>{" "}
              units in stock
            </p>
          )}

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-foreground">
                Quantity:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span
                  className="font-display font-bold text-lg w-12 text-center"
                  data-ocid="product.quantity_input"
                >
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button
              size="lg"
              className={`flex-1 font-bold gap-2 ${
                justAdded
                  ? "bg-success text-white hover:bg-success"
                  : isOutOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "gradient-amber border-0 text-primary-foreground shadow-amber"
              }`}
              disabled={isOutOfStock || addToCart.isPending}
              onClick={handleAddToCart}
              data-ocid="product.add_to_cart_button"
            >
              {justAdded ? (
                <>
                  <Check className="h-5 w-5" /> Added to Cart!
                </>
              ) : addToCart.isPending ? (
                "Adding..."
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
