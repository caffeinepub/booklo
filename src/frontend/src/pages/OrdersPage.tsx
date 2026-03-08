import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../App";
import type { Order } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";
import { OrderStatus } from "../hooks/useQueries";

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  [OrderStatus.pending]: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    className:
      "bg-warning/20 text-yellow-800 dark:text-yellow-200 border-warning/30",
  },
  [OrderStatus.processing]: {
    label: "Processing",
    icon: <Package className="h-3 w-3" />,
    className: "bg-info/20 text-blue-800 dark:text-blue-200 border-info/30",
  },
  [OrderStatus.outForDelivery]: {
    label: "Out for Delivery",
    icon: <Truck className="h-3 w-3" />,
    className:
      "bg-orange-100 text-orange-800 dark:text-orange-200 border-orange-200",
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className:
      "bg-success/20 text-green-800 dark:text-green-200 border-success/30",
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function OrderCard({ order, index }: { order: Order; index: number }) {
  const status =
    statusConfig[order.status] ?? statusConfig[OrderStatus.pending];
  const date = new Date(Number(order.createdAt) / 1_000_000);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
      data-ocid={`orders.item.${index + 1}`}
    >
      {/* Order header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-sm text-foreground">
              Order #{order.id.toString()}
            </span>
            <Badge className={`text-xs gap-1 border ${status.className}`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-extrabold text-xl text-primary">
            ₹{Number(order.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {order.items.length} item{order.items.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div
            key={item.productName}
            className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
          >
            <span className="text-foreground font-medium line-clamp-1 flex-1">
              {item.productName}
            </span>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <span className="text-muted-foreground text-xs">
                × {Number(item.quantity)}
              </span>
              <span className="font-bold text-foreground text-xs">
                ₹{Number(item.price) * Number(item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/50 rounded-lg px-3 py-2">
        <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
        <span className="line-clamp-2">{order.deliveryAddress}</span>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { navigate } = useApp();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: orders, isLoading } = useMyOrders();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="font-display font-bold text-2xl mb-2">My Orders</h2>
        <p className="text-muted-foreground mb-6">
          Please login to view your orders
        </p>
        <Button
          className="gradient-amber border-0 text-primary-foreground shadow-amber"
          onClick={() => navigate("home")}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
          My Orders
        </h1>
        <p className="text-muted-foreground mb-8">Track your deliveries</p>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => i).map((i) => (
              <Skeleton
                key={`order-skeleton-${i}`}
                className="h-40 w-full rounded-2xl"
                data-ocid="orders.loading_state"
              />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16" data-ocid="orders.empty_state">
            <div className="h-24 w-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-8">
              Browse our products and place your first order!
            </p>
            <Button
              size="lg"
              className="gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2"
              onClick={() => navigate("products")}
            >
              <ShoppingBag className="h-5 w-5" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="orders.list">
            {orders
              .slice()
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((order, i) => (
                <OrderCard key={order.id.toString()} order={order} index={i} />
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
