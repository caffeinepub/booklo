import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createContext, useContext, useState } from "react";
import AdminLoginModal from "./components/AdminLoginModal";
import Header from "./components/Header";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";

export type Page =
  | "home"
  | "products"
  | "product-detail"
  | "cart"
  | "checkout"
  | "orders"
  | "admin";

interface NavState {
  page: Page;
  productId?: bigint;
}

interface AppContextType {
  navState: NavState;
  navigate: (page: Page, productId?: bigint) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  adminUnlocked: boolean;
  setAdminUnlocked: (v: boolean) => void;
  adminLoginOpen: boolean;
  setAdminLoginOpen: (v: boolean) => void;
}

export const AppContext = createContext<AppContextType>({
  navState: { page: "home" },
  navigate: () => {},
  cartOpen: false,
  setCartOpen: () => {},
  adminUnlocked: false,
  setAdminUnlocked: () => {},
  adminLoginOpen: false,
  setAdminLoginOpen: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [navState, setNavState] = useState<NavState>({ page: "home" });
  const [cartOpen, setCartOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useUserProfile();
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const navigate = (page: Page, productId?: bigint) => {
    setNavState({ page, productId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppContext.Provider
      value={{
        navState,
        navigate,
        cartOpen,
        setCartOpen,
        adminUnlocked,
        setAdminUnlocked,
        adminLoginOpen,
        setAdminLoginOpen,
      }}
    >
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            {navState.page === "home" && <HomePage />}
            {navState.page === "products" && <ProductsPage />}
            {navState.page === "product-detail" &&
              navState.productId !== undefined && (
                <ProductDetailPage productId={navState.productId} />
              )}
            {navState.page === "cart" && <CartPage />}
            {navState.page === "checkout" && <CheckoutPage />}
            {navState.page === "orders" && <OrdersPage />}
            {navState.page === "admin" && <AdminPage />}
          </main>
          <footer className="bg-secondary text-secondary-foreground py-8 px-6 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/generated/booklo-logo-transparent.dim_200x200.png"
                  alt="BookLo"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="font-display font-bold text-lg">BookLo</span>
              </div>
              <p className="text-sm text-secondary-foreground/70 text-center">
                Books & Uniforms, Delivered Fast! 📚
              </p>
              <p className="text-sm text-secondary-foreground/60">
                © {new Date().getFullYear()}.{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-primary transition-colors"
                >
                  Built with ❤️ using caffeine.ai
                </a>
              </p>
            </div>
          </footer>
        </div>
        {showProfileSetup && <ProfileSetupModal />}
        <AdminLoginModal />
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AppContext.Provider>
  );
}
