import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Settings,
  Shirt,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import { useBookRequests } from "../hooks/useBookRequests";
import {
  OrderStatus,
  type Product,
  ProductCategory,
  useAddProduct,
  useAllOrders,
  useDeleteProduct,
  useProducts,
  useShopSettings,
  useUpdateOrderStatus,
  useUpdateProduct,
  useUpdateShopSettingsWithToken,
} from "../hooks/useQueries";
import { buildDescription, parseProductMeta } from "../utils/productMeta";

function getCategoryLabel(cat: ProductCategory) {
  if (cat === ProductCategory.books) return "Books";
  if (cat === ProductCategory.schoolUniforms) return "School Uniforms";
  return "Private Books";
}

type ProductFormData = {
  id: bigint | null;
  name: string;
  category: ProductCategory;
  description: string;
  price: string;
  stock: string;
  uniformSize: string;
  bookClass: string;
};

const emptyForm = (): ProductFormData => ({
  id: null,
  name: "",
  category: ProductCategory.books,
  description: "",
  price: "",
  stock: "",
  uniformSize: "",
  bookClass: "",
});

function ProductsTab({ token }: { token: string }) {
  const { data: allProducts, isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const handleOpen = (product?: Product) => {
    if (product) {
      const meta = parseProductMeta(product.description);
      setForm({
        id: product.id,
        name: product.name,
        category: product.category as ProductCategory,
        description: meta.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        uniformSize: meta.uniformSize,
        bookClass: meta.bookClass,
      });
    } else {
      setForm(emptyForm());
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Name, price, and stock are required");
      return;
    }
    setIsSaving(true);
    try {
      const encodedDesc = buildDescription(
        form.description,
        form.uniformSize,
        form.bookClass,
      );
      const productData: Product = {
        id: form.id ?? 0n,
        name: form.name,
        category: form.category,
        description: encodedDesc,
        price: BigInt(Math.round(Number(form.price))),
        stock: BigInt(Math.round(Number(form.stock))),
        createdAt: 0n,
      };
      if (form.id !== null) {
        await updateProduct.mutateAsync({ token, product: productData });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync({ token, product: productData });
        toast.success("Product added!");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct.mutateAsync({ token, id });
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold">Products</h2>
        <Button
          data-ocid="admin.product.open_modal_button"
          onClick={() => handleOpen()}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div
          className="text-center py-12"
          data-ocid="admin.product.loading_state"
        >
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : !allProducts || allProducts.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
          data-ocid="admin.product.empty_state"
        >
          No products yet. Add your first product.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.product.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Extra Info</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProducts.map((product, idx) => {
                const meta = parseProductMeta(product.description);
                const isUniform =
                  product.category === ProductCategory.schoolUniforms;
                const isBook =
                  product.category === ProductCategory.books ||
                  product.category === ProductCategory.privateBooks;
                return (
                  <TableRow
                    key={product.id.toString()}
                    data-ocid={`admin.product.row.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryLabel(product.category as ProductCategory)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isUniform && meta.uniformSize && (
                        <Badge variant="outline">
                          Size: {meta.uniformSize}
                        </Badge>
                      )}
                      {isBook && meta.bookClass && (
                        <Badge variant="outline">{meta.bookClass}</Badge>
                      )}
                    </TableCell>
                    <TableCell>₹{Number(product.price)}</TableCell>
                    <TableCell>{Number(product.stock)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`admin.product.edit_button.${idx + 1}`}
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpen(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          data-ocid={`admin.product.delete_button.${idx + 1}`}
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="admin.product.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {form.id ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                data-ocid="admin.product.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. NCERT Mathematics Class 10"
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ProductCategory }))
                }
              >
                <SelectTrigger data-ocid="admin.product.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProductCategory.books}>Books</SelectItem>
                  <SelectItem value={ProductCategory.schoolUniforms}>
                    School Uniforms
                  </SelectItem>
                  <SelectItem value={ProductCategory.privateBooks}>
                    Private Books
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.category === ProductCategory.schoolUniforms && (
              <div>
                <Label>Uniform Size (optional)</Label>
                <Input
                  data-ocid="admin.product.size.input"
                  type="number"
                  value={form.uniformSize}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, uniformSize: e.target.value }))
                  }
                  placeholder="e.g. 36, 38, 40..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter numeric size like 36, 38, 40, 42...
                </p>
              </div>
            )}

            {(form.category === ProductCategory.books ||
              form.category === ProductCategory.privateBooks) && (
              <div>
                <Label>Book Class (optional)</Label>
                <Input
                  data-ocid="admin.product.class.input"
                  value={form.bookClass}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bookClass: e.target.value }))
                  }
                  placeholder="e.g. Class 10, Class 12, LKG..."
                />
              </div>
            )}

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                data-ocid="admin.product.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  data-ocid="admin.product.price.input"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="e.g. 250"
                />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input
                  data-ocid="admin.product.stock.input"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="admin.product.save_button"
                className="flex-1 bg-primary text-primary-foreground"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {form.id ? "Update" : "Add"} Product
              </Button>
              <Button
                data-ocid="admin.product.cancel_button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrdersTab({ token }: { token: string }) {
  const { data: orders, isLoading } = useAllOrders(token);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({
        token,
        orderId,
        status: status as OrderStatus,
      });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const localOrders = (() => {
    try {
      return JSON.parse(localStorage.getItem("booklo_orders") ?? "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">Orders</h2>
      {isLoading ? (
        <div
          className="text-center py-12"
          data-ocid="admin.orders.loading_state"
        >
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {(!orders || orders.length === 0) && localOrders.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
              data-ocid="admin.orders.empty_state"
            >
              No orders yet.
            </div>
          ) : null}

          {orders && orders.length > 0 && (
            <div className="overflow-x-auto mb-6">
              <Table data-ocid="admin.orders.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Address / Phone</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={order.id.toString()}
                      data-ocid={`admin.orders.row.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{order.deliveryAddress}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.phoneNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        {order.items.map((item) => (
                          <p
                            key={`${order.id}-${item.productName}`}
                            className="text-xs"
                          >
                            {item.productName} × {Number(item.quantity)}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell>₹{Number(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {order.paymentMethod === "cashOnDelivery"
                            ? "COD"
                            : "UPI"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order.id, v)}
                        >
                          <SelectTrigger
                            data-ocid={`admin.orders.select.${idx + 1}`}
                            className="w-36 text-xs h-8"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={OrderStatus.pending}>
                              Pending
                            </SelectItem>
                            <SelectItem value={OrderStatus.processing}>
                              Processing
                            </SelectItem>
                            <SelectItem value={OrderStatus.outForDelivery}>
                              Out for Delivery
                            </SelectItem>
                            <SelectItem value={OrderStatus.delivered}>
                              Delivered
                            </SelectItem>
                            <SelectItem value={OrderStatus.cancelled}>
                              Cancelled
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {localOrders.length > 0 && (
            <>
              <h3 className="font-display font-semibold mb-2 text-muted-foreground text-sm">
                Locally Stored Orders
              </h3>
              <div className="space-y-3">
                {localOrders.map(
                  (
                    order: {
                      id: string;
                      customerName: string;
                      phone: string;
                      address: string;
                      items: {
                        name: string;
                        quantity: number;
                        price: number;
                      }[];
                      total: number;
                      paymentMethod: string;
                      status: string;
                      createdAt: string;
                    },
                    idx: number,
                  ) => (
                    <Card
                      key={order.id}
                      data-ocid={`admin.local-orders.row.${idx + 1}`}
                      className="p-4"
                    >
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.phone} · {order.address}
                          </p>
                          <div className="mt-1">
                            {order.items.map((it) => (
                              <span
                                key={`${order.id}-${it.name}`}
                                className="text-xs mr-2"
                              >
                                {it.name} ×{it.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{order.total}</p>
                          <Badge variant="outline" className="text-xs">
                            {order.paymentMethod}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function BookRequestsTab() {
  const requests = useBookRequests();

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">Book Requests</h2>
      {requests.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
          data-ocid="admin.book-requests.empty_state"
        >
          No book requests yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.book-requests.table">
            <TableHeader>
              <TableRow>
                <TableHead>Book Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req, idx) => (
                <TableRow
                  key={req.id}
                  data-ocid={`admin.book-requests.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">{req.bookName}</TableCell>
                  <TableCell>{req.author || "-"}</TableCell>
                  <TableCell>{req.bookClass || "-"}</TableCell>
                  <TableCell>{req.phone}</TableCell>
                  <TableCell>{req.notes || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ token }: { token: string }) {
  const { data: settings } = useShopSettings();
  const updateSettings = useUpdateShopSettingsWithToken();

  const [shippingAmount, setShippingAmount] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercent, setGstPercent] = useState("18");
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setShippingAmount(settings.shippingAmount.toString());
      setGstEnabled(settings.gstEnabled);
      setGstPercent(settings.gstPercent.toString());
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        token,
        settings: {
          shippingAmount: BigInt(Math.round(Number(shippingAmount) || 0)),
          gstEnabled,
          gstPercent: BigInt(Math.round(Number(gstPercent) || 18)),
        },
      });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-bold mb-6">Settings</h2>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <Label htmlFor="shipping">Shipping Amount (₹)</Label>
            <Input
              data-ocid="admin.settings.input"
              id="shipping"
              type="number"
              min="0"
              value={shippingAmount}
              onChange={(e) => setShippingAmount(e.target.value)}
              placeholder="0 for free shipping"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>GST Enabled</Label>
              <p className="text-xs text-muted-foreground">
                Apply GST on all orders
              </p>
            </div>
            <Switch
              data-ocid="admin.settings.switch"
              checked={gstEnabled}
              onCheckedChange={setGstEnabled}
            />
          </div>
          {gstEnabled && (
            <div>
              <Label htmlFor="gstPercent">GST Rate (%)</Label>
              <Input
                data-ocid="admin.settings.gst.input"
                id="gstPercent"
                type="number"
                min="0"
                max="100"
                value={gstPercent}
                onChange={(e) => setGstPercent(e.target.value)}
                placeholder="18"
              />
            </div>
          )}
          <Button
            data-ocid="admin.settings.save_button"
            className="w-full bg-primary text-primary-foreground"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { adminToken, setAdminToken, navigate } = useApp();

  if (!adminToken) {
    navigate("admin-login");
    return null;
  }

  const handleLogout = () => {
    setAdminToken("");
    navigate("home");
    toast.success("Logged out");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            Manage products, orders, and settings
          </p>
        </div>
        <Button
          data-ocid="admin.logout.button"
          variant="outline"
          onClick={handleLogout}
          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6" data-ocid="admin.tab">
          <TabsTrigger value="products" data-ocid="admin.products.tab">
            <BookOpen className="h-4 w-4 mr-1" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            <Package className="h-4 w-4 mr-1" /> Orders
          </TabsTrigger>
          <TabsTrigger
            value="book-requests"
            data-ocid="admin.book-requests.tab"
          >
            <Shirt className="h-4 w-4 mr-1" /> Book Requests
          </TabsTrigger>
          <TabsTrigger value="settings" data-ocid="admin.settings.tab">
            <Settings className="h-4 w-4 mr-1" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab token={adminToken} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab token={adminToken} />
        </TabsContent>
        <TabsContent value="book-requests">
          <BookRequestsTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab token={adminToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
