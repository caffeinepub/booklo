import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, GraduationCap, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ProductCategory } from "../hooks/useQueries";
import { useAddToCart } from "../hooks/useQueries";

interface ProductCardProps {
  product: Product;
  onViewDetail?: () => void;
}

export default function ProductCard({
  product,
  onViewDetail,
}: ProductCardProps) {
  const { navigate } = useApp();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const addToCart = useAddToCart();
  const [justAdded, setJustAdded] = useState(false);

  const imageUrl = product.image ? product.image.getDirectURL() : null;
  const isOutOfStock = product.stock === 0n;
  const isBook = product.category === ProductCategory.books;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    if (isOutOfStock) return;
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1n });
      setJustAdded(true);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleCardClick = () => {
    if (onViewDetail) {
      onViewDetail();
    } else {
      navigate("product-detail", product.id);
    }
  };

  const displayImage = imageUrl || null;

  return (
    <article className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border/50 group">
      {/* Clickable image/title area */}
      <button
        type="button"
        className="w-full text-left focus:outline-none"
        onClick={handleCardClick}
        aria-label={`View ${product.name} details`}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                {isBook ? (
                  <BookOpen className="h-16 w-16 mx-auto opacity-20" />
                ) : (
                  <GraduationCap className="h-16 w-16 mx-auto opacity-20" />
                )}
              </div>
            </div>
          )}
          {/* Category badge overlay */}
          <div className="absolute top-3 left-3">
            <Badge
              className={`text-xs font-semibold border-0 ${
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
                  <GraduationCap className="h-3 w-3 mr-1" /> Uniform
                </>
              )}
            </Badge>
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
              <Badge
                variant="destructive"
                className="text-sm font-bold px-4 py-1"
              >
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Name preview in button area */}
        <div className="px-4 pt-3 pb-1">
          <h3 className="font-display font-bold text-base leading-tight line-clamp-2 text-card-foreground">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
            {product.description.split("\n\n__META__")[0]}
          </p>
        </div>
      </button>

      {/* Non-clickable info + CTA */}
      <div className="px-4 pb-4 pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display font-extrabold text-xl text-primary">
            ₹{Number(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">
            {isOutOfStock ? (
              <span className="text-destructive font-medium">Out of stock</span>
            ) : (
              <span>{Number(product.stock)} in stock</span>
            )}
          </span>
        </div>

        <Button
          className={`w-full font-semibold gap-2 transition-all ${
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
              <Check className="h-4 w-4" /> Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
