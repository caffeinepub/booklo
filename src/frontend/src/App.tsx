import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createContext, useContext, useState } from "react";
import Header from "./components/Header";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

export type Page =
  | "home"
  | "cart"
  | "checkout"
  | "order-confirmation"
  | "admin-login"
  | "admin-dashboard";

interface AppContextType {
  page: Page;
  navigate: (page: Page) => void;
  cartItems: CartItem[];
  addToCart: (product: CartProduct) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  removeFromCart: (productId: bigint) => void;
  clearCart: () => void;
  adminToken: string;
  setAdminToken: (token: string) => void;
  lastOrderId: string;
  setLastOrderId: (id: string) => void;
}

export interface CartProduct {
  id: bigint;
  name: string;
  price: bigint;
  category: string;
  description: string;
  stock: bigint;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

const CART_KEY = "booklo_cart";
const ADMIN_TOKEN_KEY = "booklo_admin_token";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item: { product: CartProduct; quantity: number }) => ({
      product: {
        ...item.product,
        id: BigInt(item.product.id),
        price: BigInt(item.product.price),
        stock: BigInt(item.product.stock),
      },
      quantity: item.quantity,
    }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const AppContext = createContext<AppContextType>({
  page: "home",
  navigate: () => {},
  cartItems: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  adminToken: "",
  setAdminToken: () => {},
  lastOrderId: "",
  setLastOrderId: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
  const [adminToken, setAdminTokenState] = useState(
    () => sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? "",
  );
  const [lastOrderId, setLastOrderId] = useState("");

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setAdminToken = (token: string) => {
    setAdminTokenState(token);
    if (token) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  const addToCart = (product: CartProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      } else {
        next = [...prev, { product, quantity: 1 }];
      }
      saveCart(next);
      return next;
    });
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    setCartItems((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((i) => i.product.id !== productId)
          : prev.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i,
            );
      saveCart(next);
      return next;
    });
  };

  const removeFromCart = (productId: bigint) => {
    setCartItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId);
      saveCart(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        adminToken,
        setAdminToken,
        lastOrderId,
        setLastOrderId,
      }}
    >
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            {page === "home" && <HomePage />}
            {page === "cart" && <CartPage />}
            {page === "checkout" && <CheckoutPage />}
            {page === "order-confirmation" && <OrderConfirmationPage />}
            {page === "admin-login" && <AdminLoginPage />}
            {page === "admin-dashboard" && <AdminDashboardPage />}
          </main>
          <footer className="bg-primary text-primary-foreground py-8 px-6 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="font-display font-bold text-xl tracking-tight">
                  BookLo
                </span>
              </div>
              <p className="text-sm opacity-75 text-center">
                Books &amp; Uniforms, Delivered Fast!
              </p>
              <p className="text-sm opacity-60">
                © {new Date().getFullYear()}.{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-90 transition-opacity"
                >
                  Built with ❤️ using caffeine.ai
                </a>
              </p>
            </div>
          </footer>
        </div>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AppContext.Provider>
  );
}
