import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useApp } from "../App";

export default function OrderConfirmationPage() {
  const { navigate, lastOrderId } = useApp();

  return (
    <div
      className="max-w-lg mx-auto px-4 py-16 text-center"
      data-ocid="order-confirmation.panel"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h1 className="font-display text-3xl font-bold mb-3">Order Placed!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your order. We'll contact you soon.
      </p>
      {lastOrderId && (
        <p className="text-sm font-mono bg-secondary rounded-lg px-4 py-2 inline-block mb-6">
          Order ID: <strong>{lastOrderId}</strong>
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Button
          data-ocid="order-confirmation.primary_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate("home")}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
