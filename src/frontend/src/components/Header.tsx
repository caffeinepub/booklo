import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  Lock,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  X,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCart, useIsAdmin } from "../hooks/useQueries";

export default function Header() {
  const { navigate, navState, adminUnlocked, setAdminLoginOpen } = useApp();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();
  const { data: cart } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount =
    cart?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message === "User is already authenticated"
        ) {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <header className="sticky top-0 z-50 glass-effect shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-2 flex-shrink-0 group"
          data-ocid="nav.home_link"
        >
          <img
            src="/assets/generated/booklo-logo-transparent.dim_200x200.png"
            alt="BookLo"
            className="h-9 w-9 rounded-full object-cover group-hover:scale-105 transition-transform"
          />
          <span className="font-display font-extrabold text-xl text-secondary tracking-tight hidden sm:inline">
            Book<span className="text-gradient-amber">Lo</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate("home")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              navState.page === "home"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            data-ocid="nav.home_link"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => navigate("products")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              navState.page === "products" || navState.page === "product-detail"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            data-ocid="nav.products_link"
          >
            Shop
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("orders")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                navState.page === "orders"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-ocid="nav.orders_link"
            >
              My Orders
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                navState.page === "admin"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              data-ocid="nav.admin_link"
            >
              Admin
            </button>
          )}
          {/* Admin Panel button — always visible */}
          {adminUnlocked ? (
            <button
              type="button"
              onClick={() => navigate("admin")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                navState.page === "admin"
                  ? "bg-amber-100 border-amber-400 text-amber-800"
                  : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
              }`}
              data-ocid="nav.admin_panel_button"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAdminLoginOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent border border-dashed border-border"
              data-ocid="nav.admin_panel_button"
            >
              <Lock className="h-3.5 w-3.5" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("cart")}
            data-ocid="nav.cart_button"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs gradient-amber border-0 text-primary-foreground">
                {cartCount}
              </Badge>
            )}
          </Button>

          {/* Admin badge */}
          {isAdmin && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-300">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </span>
          )}

          {/* Auth button */}
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuth}
              className="hidden sm:flex gap-2 items-center border-border"
              data-ocid="nav.logout_button"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="hidden sm:flex gap-2 items-center gradient-amber border-0 text-primary-foreground shadow-amber"
              data-ocid="nav.login_button"
            >
              <LogIn className="h-4 w-4" />
              <span>{isLoggingIn ? "Logging in..." : "Login"}</span>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 py-3 flex flex-col gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              navigate("home");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-left"
            data-ocid="nav.home_link"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            Home
          </button>
          <button
            type="button"
            onClick={() => {
              navigate("products");
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-left"
            data-ocid="nav.products_link"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            Shop
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                navigate("orders");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-left"
              data-ocid="nav.orders_link"
            >
              <ClipboardList className="h-4 w-4 text-primary" />
              My Orders
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                navigate("admin");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-left"
              data-ocid="nav.admin_link"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Admin
            </button>
          )}
          {isAdmin && (
            <div className="flex items-center gap-2 px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                You are logged in as Admin
              </span>
            </div>
          )}
          {/* Admin Panel — always visible in mobile menu */}
          {adminUnlocked ? (
            <button
              type="button"
              onClick={() => {
                navigate("admin");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold bg-amber-50 border border-amber-300 text-amber-800 transition-colors hover:bg-amber-100 text-left"
              data-ocid="nav.admin_panel_button"
            >
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Admin Panel
              <span className="ml-auto text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                Unlocked
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAdminLoginOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-dashed border-border hover:bg-accent transition-colors text-left text-muted-foreground"
              data-ocid="nav.admin_panel_button"
            >
              <Lock className="h-4 w-4" />
              Admin Panel
              <span className="ml-auto text-xs text-muted-foreground/60">
                Password protected
              </span>
            </button>
          )}
          <div className="pt-2 border-t border-border">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                data-ocid="nav.logout_button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                className="w-full gap-2 gradient-amber border-0 text-primary-foreground shadow-amber"
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
              >
                <LogIn className="h-4 w-4" />
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
