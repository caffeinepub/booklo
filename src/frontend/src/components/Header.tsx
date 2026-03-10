import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, Shield, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../App";

export default function Header() {
  const { navigate, cartItems, adminToken } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const isAdmin = !!adminToken;

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button
          type="button"
          data-ocid="nav.link"
          onClick={() => navigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">📚</span>
          <span className="font-display font-bold text-2xl tracking-tight">
            BookLo
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-2">
          <Button
            data-ocid="nav.home.link"
            variant="ghost"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => navigate("home")}
          >
            Home
          </Button>
          <Button
            data-ocid="nav.cart.link"
            variant="ghost"
            className="text-primary-foreground hover:bg-white/10 relative"
            onClick={() => navigate("cart")}
          >
            <ShoppingCart className="h-5 w-5 mr-1" />
            Cart
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 text-xs bg-accent text-accent-foreground">
                {cartCount}
              </Badge>
            )}
          </Button>
          {isAdmin ? (
            <Button
              data-ocid="nav.admin.link"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => navigate("admin-dashboard")}
            >
              <Shield className="h-4 w-4 mr-1" /> Admin
            </Button>
          ) : (
            <Button
              data-ocid="nav.admin-login.link"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => navigate("admin-login")}
            >
              <Shield className="h-4 w-4 mr-1" /> Admin
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            data-ocid="nav.cart.link"
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10 relative"
            onClick={() => navigate("cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 text-xs bg-accent text-accent-foreground">
                {cartCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 px-4 pb-4 flex flex-col gap-1">
          <Button
            data-ocid="nav.home.link"
            variant="ghost"
            className="w-full justify-start text-primary-foreground hover:bg-white/10"
            onClick={() => {
              navigate("home");
              setMobileOpen(false);
            }}
          >
            Home
          </Button>
          {isAdmin ? (
            <Button
              data-ocid="nav.admin.link"
              variant="ghost"
              className="w-full justify-start text-primary-foreground hover:bg-white/10"
              onClick={() => {
                navigate("admin-dashboard");
                setMobileOpen(false);
              }}
            >
              <Shield className="h-4 w-4 mr-1" /> Admin Panel
            </Button>
          ) : (
            <Button
              data-ocid="nav.admin-login.link"
              variant="ghost"
              className="w-full justify-start text-primary-foreground hover:bg-white/10"
              onClick={() => {
                navigate("admin-login");
                setMobileOpen(false);
              }}
            >
              <Shield className="h-4 w-4 mr-1" /> Admin
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
