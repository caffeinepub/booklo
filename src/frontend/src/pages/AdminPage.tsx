import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  GraduationCap,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  OrderStatus,
  ProductCategory,
  type ShopSettings,
  useAddProduct,
  useAllOrders,
  useDeleteProduct,
  useIsAdmin,
  useProducts,
  useShopSettings,
  useUpdateOrderStatus,
  useUpdateProduct,
  useUpdateShopSettings,
} from "../hooks/useQueries";

// Sample products to seed
const SAMPLE_PRODUCTS = [
  {
    name: "Harry Potter and the Philosopher's Stone",
    description:
      "The magical first book in J.K. Rowling's legendary Harry Potter series. Perfect for young readers and fantasy enthusiasts.",
    category: ProductCategory.books,
    price: 499n,
    stock: 50n,
  },
  {
    name: "The Alchemist",
    description:
      "Paulo Coelho's masterpiece about following your dreams. A timeless tale of self-discovery and personal legend.",
    category: ProductCategory.books,
    price: 299n,
    stock: 30n,
  },
  {
    name: "NCERT Mathematics Class 10",
    description:
      "Official NCERT textbook for Class 10 Mathematics. Covers all chapters as per CBSE syllabus.",
    category: ProductCategory.books,
    price: 180n,
    stock: 100n,
  },
  {
    name: "School Shirt (White, Sizes S-XL)",
    description:
      "Premium quality white cotton school shirt. Available in sizes S, M, L, and XL. Durable and comfortable for everyday use.",
    category: ProductCategory.schoolUniforms,
    price: 350n,
    stock: 80n,
  },
  {
    name: "School Trousers (Grey, Sizes 26-36)",
    description:
      "Classic grey school trousers with belt loops. Available in waist sizes 26 to 36 inches. Machine washable.",
    category: ProductCategory.schoolUniforms,
    price: 450n,
    stock: 60n,
  },
  {
    name: "School Tie (House Colors)",
    description:
      "Traditional striped school tie with vibrant house colors (red, blue, green, yellow). Polyester blend for easy care.",
    category: ProductCategory.schoolUniforms,
    price: 120n,
    stock: 120n,
  },
];

const statusOptions = [
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.processing, label: "Processing" },
  { value: OrderStatus.outForDelivery, label: "Out for Delivery" },
  { value: OrderStatus.delivered, label: "Delivered" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-warning/20 text-yellow-800 border-warning/30",
  [OrderStatus.processing]: "bg-info/20 text-blue-800 border-info/30",
  [OrderStatus.outForDelivery]:
    "bg-orange-100 text-orange-800 border-orange-200",
  [OrderStatus.delivered]: "bg-success/20 text-green-800 border-success/30",
  [OrderStatus.cancelled]:
    "bg-destructive/10 text-destructive border-destructive/20",
};

interface ProductFormState {
  name: string;
  description: string;
  category: ProductCategory;
  price: string;
  stock: string;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  category: ProductCategory.books,
  price: "",
  stock: "",
};

export default function AdminPage() {
  const { navigate } = useApp();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: shopSettings } = useShopSettings();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateShopSettings = useUpdateShopSettings();

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<bigint | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [seeding, setSeeding] = useState(false);
  const [settingsShipping, setSettingsShipping] = useState<string>("0");
  const [settingsGstEnabled, setSettingsGstEnabled] = useState<boolean>(false);
  const [settingsGstPercent, setSettingsGstPercent] = useState<string>("18");

  // Auto-seed if admin and empty catalog - note: seeding state intentionally excluded to avoid loop
  // biome-ignore lint/correctness/useExhaustiveDependencies: seeding excluded intentionally
  useEffect(() => {
    if (isAdmin && products && products.length === 0 && !seeding) {
      handleSeedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, products]);

  // Sync shopSettings into local settings state when loaded
  useEffect(() => {
    if (shopSettings) {
      setSettingsShipping(Number(shopSettings.shippingAmount).toString());
      setSettingsGstEnabled(shopSettings.gstEnabled);
      setSettingsGstPercent(Number(shopSettings.gstPercent).toString());
    }
  }, [shopSettings]);

  const handleSeedProducts = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      await Promise.all(
        SAMPLE_PRODUCTS.map((p) =>
          addProduct.mutateAsync({
            id: 0n,
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
            stock: p.stock,
            createdAt: BigInt(Date.now()) * 1_000_000n,
          }),
        ),
      );
      toast.success("Sample products seeded successfully!");
    } catch {
      toast.error("Failed to seed products");
    } finally {
      setSeeding(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowProductDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    setShowProductDialog(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }
    const productData: Product = {
      id: editingProduct?.id ?? 0n,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: BigInt(form.price),
      stock: BigInt(form.stock),
      createdAt: editingProduct?.createdAt ?? BigInt(Date.now()) * 1_000_000n,
    };
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync(productData);
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync(productData);
        toast.success("Product added!");
      }
      setShowProductDialog(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async () => {
    if (deleteProductId === null) return;
    try {
      await deleteProduct.mutateAsync(deleteProductId);
      toast.success("Product deleted");
      setDeleteProductId(null);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: bigint,
    status: OrderStatus,
  ) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings: ShopSettings = {
      shippingAmount: BigInt(Math.max(0, Number(settingsShipping) || 0)),
      gstEnabled: settingsGstEnabled,
      gstPercent: BigInt(
        Math.min(100, Math.max(0, Number(settingsGstPercent) || 0)),
      ),
    };
    try {
      await updateShopSettings.mutateAsync(newSettings);
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (!isAuthenticated || adminLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You don't have admin access
        </p>
        <Button
          className="gradient-amber border-0 text-primary-foreground"
          onClick={() => navigate("home")}
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl gradient-amber flex items-center justify-center shadow-amber">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-3xl text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage products and orders
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Total Products",
              value: String(products?.length ?? 0),
              icon: <Package className="h-5 w-5" />,
            },
            {
              label: "Total Orders",
              value: String(orders?.length ?? 0),
              icon: <ShoppingBag className="h-5 w-5" />,
            },
            {
              label: "Pending Orders",
              value: String(
                orders?.filter((o) => o.status === OrderStatus.pending)
                  .length ?? 0,
              ),
              icon: <Package className="h-5 w-5" />,
            },
            {
              label: "Delivered",
              value: String(
                orders?.filter((o) => o.status === OrderStatus.delivered)
                  .length ?? 0,
              ),
              icon: <Package className="h-5 w-5" />,
            },
            {
              label: "Total Revenue",
              value: `₹${orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0) ?? 0}`,
              icon: <TrendingUp className="h-5 w-5" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary">{stat.icon}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="font-display font-extrabold text-2xl text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList className="bg-muted/60 p-1 rounded-xl mb-6">
            <TabsTrigger
              value="products"
              className="rounded-lg font-semibold data-[state=active]:bg-card gap-2"
              data-ocid="admin.products_tab"
            >
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-lg font-semibold data-[state=active]:bg-card gap-2"
              data-ocid="admin.orders_tab"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg font-semibold data-[state=active]:bg-card gap-2"
              data-ocid="admin.settings_tab"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-lg">All Products</h2>
                <div className="flex gap-2">
                  {products?.length === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSeedProducts}
                      disabled={seeding}
                      className="gap-2"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${seeding ? "animate-spin" : ""}`}
                      />
                      Seed Demo Data
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="gradient-amber border-0 text-primary-foreground shadow-amber gap-2 font-semibold"
                    onClick={openAddDialog}
                    data-ocid="admin.add_product_button"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <Skeleton
                      key={`prod-skel-${n}`}
                      className="h-12 w-full rounded-lg"
                    />
                  ))}
                </div>
              ) : !products?.length ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.products.empty_state"
                >
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No products yet</p>
                  <p className="text-sm">
                    Add your first product or seed demo data
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.products.table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Stock
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, i) => (
                        <TableRow
                          key={product.id.toString()}
                          data-ocid={`admin.products.row.${i + 1}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-semibold text-sm line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 text-xs ${
                                product.category === ProductCategory.books
                                  ? "bg-secondary text-secondary-foreground"
                                  : "gradient-amber text-primary-foreground"
                              }`}
                            >
                              {product.category === ProductCategory.books ? (
                                <>
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  Book
                                </>
                              ) : (
                                <>
                                  <GraduationCap className="h-3 w-3 mr-1" />
                                  Uniform
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            ₹{Number(product.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-semibold ${Number(product.stock) === 0 ? "text-destructive" : "text-foreground"}`}
                            >
                              {Number(product.stock)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(product)}
                                data-ocid={`admin.products.edit_button.${i + 1}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteProductId(product.id)}
                                data-ocid={`admin.products.delete_button.${i + 1}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-display font-bold text-lg">All Orders</h2>
              </div>

              {ordersLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <Skeleton
                      key={`order-skel-${n}`}
                      className="h-12 w-full rounded-lg"
                    />
                  ))}
                </div>
              ) : !orders?.length ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.orders.empty_state"
                >
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.orders.table">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">
                          Order ID
                        </TableHead>
                        <TableHead className="font-semibold">Items</TableHead>
                        <TableHead className="font-semibold">Total</TableHead>
                        <TableHead className="font-semibold">Address</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders
                        .slice()
                        .sort(
                          (a, b) => Number(b.createdAt) - Number(a.createdAt),
                        )
                        .map((order, i) => (
                          <TableRow
                            key={order.id.toString()}
                            data-ocid={`admin.orders.row.${i + 1}`}
                          >
                            <TableCell className="font-mono text-xs">
                              #{order.id.toString()}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                {order.items.slice(0, 2).map((item) => (
                                  <p
                                    key={item.productName}
                                    className="text-xs text-muted-foreground line-clamp-1"
                                  >
                                    {item.productName} × {Number(item.quantity)}
                                  </p>
                                ))}
                                {order.items.length > 2 && (
                                  <p className="text-xs text-primary">
                                    +{order.items.length - 2} more
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              ₹{Number(order.totalAmount)}
                            </TableCell>
                            <TableCell className="max-w-32">
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {order.deliveryAddress}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  handleUpdateOrderStatus(
                                    order.id,
                                    value as OrderStatus,
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={`h-8 text-xs border rounded-lg w-40 ${statusColors[order.status]}`}
                                  data-ocid={`admin.orders.status_select.${i + 1}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                      className="text-xs"
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-lg">
              {/* Shipping Settings */}
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
                <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Shipping Settings
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Configure the shipping fee applied to all orders
                </p>
                <div className="space-y-2">
                  <Label htmlFor="shipping-amount" className="font-semibold">
                    Shipping Amount (₹)
                  </Label>
                  <Input
                    id="shipping-amount"
                    type="number"
                    min={0}
                    value={settingsShipping}
                    onChange={(e) => setSettingsShipping(e.target.value)}
                    placeholder="e.g. 50"
                    className="rounded-xl"
                    data-ocid="admin.settings.shipping_input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for free shipping
                  </p>
                </div>
              </div>

              {/* Tax Settings */}
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
                <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Tax Settings
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Enable or disable GST on orders
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="gst-toggle"
                        className="font-semibold cursor-pointer"
                      >
                        Enable GST
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Apply Goods and Services Tax to all orders
                      </p>
                    </div>
                    <Switch
                      id="gst-toggle"
                      checked={settingsGstEnabled}
                      onCheckedChange={setSettingsGstEnabled}
                      data-ocid="admin.settings.gst_toggle"
                    />
                  </div>
                  {settingsGstEnabled && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <Label htmlFor="gst-percent" className="font-semibold">
                        GST Percentage (%)
                      </Label>
                      <Input
                        id="gst-percent"
                        type="number"
                        min={0}
                        max={100}
                        value={settingsGstPercent}
                        onChange={(e) => setSettingsGstPercent(e.target.value)}
                        placeholder="e.g. 18"
                        className="rounded-xl"
                        data-ocid="admin.settings.gst_percent_input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Standard GST rates: 5%, 12%, 18%, or 28%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2"
                disabled={updateShopSettings.isPending}
                data-ocid="admin.settings.save_button"
              >
                {updateShopSettings.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" /> Save Settings
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Product Add/Edit Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="admin.product_form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product details"
                : "Add a new product to your catalog"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                placeholder="e.g. NCERT Physics Class 12"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                data-ocid="admin.product_form.name_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-desc">Description</Label>
              <Textarea
                id="product-desc"
                placeholder="Brief product description..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as ProductCategory }))
                  }
                >
                  <SelectTrigger data-ocid="admin.product_form.category_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductCategory.books}>
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Books
                      </span>
                    </SelectItem>
                    <SelectItem value={ProductCategory.schoolUniforms}>
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> School Uniforms
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Price (₹) *</Label>
                <Input
                  id="product-price"
                  type="number"
                  placeholder="e.g. 299"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock Quantity *</Label>
              <Input
                id="product-stock"
                type="number"
                placeholder="e.g. 50"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                min="0"
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductDialog(false)}
                data-ocid="admin.product_form.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-amber border-0 text-primary-foreground shadow-amber font-semibold gap-2"
                disabled={addProduct.isPending || updateProduct.isPending}
                data-ocid="admin.product_form.submit_button"
              >
                {addProduct.isPending || updateProduct.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent data-ocid="admin.delete_product.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.delete_product.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.delete_product.confirm_button"
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
