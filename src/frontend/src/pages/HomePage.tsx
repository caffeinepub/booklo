import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Phone,
  Shield,
  Shirt,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type CartProduct, useApp } from "../App";
import { useSubmitBookRequest } from "../hooks/useBookRequests";
import { ProductCategory, useProducts } from "../hooks/useQueries";
import { getCategoryLabel, parseProductMeta } from "../utils/productMeta";

function ProductCard({
  product,
}: { product: CartProduct & { rawDescription: string } }) {
  const { addToCart } = useApp();
  const meta = parseProductMeta(product.rawDescription);
  const isUniform = product.category === ProductCategory.schoolUniforms;
  const isBook =
    product.category === ProductCategory.books ||
    product.category === ProductCategory.privateBooks;

  return (
    <Card className="flex flex-col border-border shadow-card hover:shadow-card-hover transition-shadow duration-200">
      {/* Icon area */}
      <div className="flex items-center justify-center h-24 bg-secondary rounded-t-lg">
        {isUniform ? (
          <Shirt className="h-12 w-12 text-primary opacity-60" />
        ) : (
          <BookOpen className="h-12 w-12 text-primary opacity-60" />
        )}
      </div>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base font-display leading-tight">
          {product.name}
        </CardTitle>
        <div className="flex flex-wrap gap-1 mt-1">
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(product.category)}
          </Badge>
          {isUniform && meta.uniformSize && (
            <Badge variant="outline" className="text-xs">
              Size: {meta.uniformSize}
            </Badge>
          )}
          {isBook && meta.bookClass && (
            <Badge variant="outline" className="text-xs">
              {meta.bookClass}
            </Badge>
          )}
          {product.category === ProductCategory.privateBooks && (
            <Badge className="text-xs bg-accent text-accent-foreground">
              10% off
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        {meta.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {meta.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {Number(product.stock) > 0
            ? `In stock: ${product.stock}`
            : "Out of stock"}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between">
        <span className="font-display font-bold text-lg text-primary">
          ₹{Number(product.price)}
        </span>
        <Button
          data-ocid="product.add_button"
          size="sm"
          disabled={Number(product.stock) === 0}
          onClick={() => {
            addToCart(product);
            toast.success(`${product.name} added to cart`);
          }}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductSection({
  title,
  category,
  icon,
}: { title: string; category: ProductCategory; icon: React.ReactNode }) {
  const { data: products, isLoading } = useProducts(category);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
          {icon}
        </div>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-64 rounded-lg"
              data-ocid="product.loading_state"
            />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div
          data-ocid="product.empty_state"
          className="text-center py-12 text-muted-foreground border border-dashed rounded-lg"
        >
          <p className="text-sm">No products in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id.toString()}
              product={{
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category as unknown as string,
                description: p.description,
                rawDescription: p.description,
                stock: p.stock,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BookRequestForm() {
  const submitRequest = useSubmitBookRequest();
  const [form, setForm] = useState({
    bookName: "",
    author: "",
    bookClass: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bookName || !form.phone) {
      toast.error("Book name and phone are required");
      return;
    }
    submitRequest({ ...form });
    toast.success("Book request submitted!");
    setForm({ bookName: "", author: "", bookClass: "", phone: "", notes: "" });
  };

  return (
    <section className="bg-secondary rounded-2xl p-6 sm:p-10">
      <h2 className="font-display text-2xl font-bold mb-2">
        Can't find your book?
      </h2>
      <p className="text-muted-foreground mb-6">
        Submit a request and we'll try to get it for you.
      </p>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bookName">Book Name *</Label>
          <Input
            data-ocid="book-request.input"
            id="bookName"
            value={form.bookName}
            onChange={(e) =>
              setForm((f) => ({ ...f, bookName: e.target.value }))
            }
            placeholder="e.g. NCERT Mathematics"
          />
        </div>
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            data-ocid="book-request.author.input"
            id="author"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            placeholder="Author name"
          />
        </div>
        <div>
          <Label htmlFor="bookClass">Class / Grade</Label>
          <Input
            data-ocid="book-request.class.input"
            id="bookClass"
            value={form.bookClass}
            onChange={(e) =>
              setForm((f) => ({ ...f, bookClass: e.target.value }))
            }
            placeholder="e.g. Class 10"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            data-ocid="book-request.phone.input"
            id="phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Your contact number"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            data-ocid="book-request.textarea"
            id="notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any specific edition, publisher..."
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            data-ocid="book-request.submit_button"
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <section className="mb-12 bg-primary rounded-2xl p-8 sm:p-12 text-primary-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <h1 className="font-display text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Books &amp; Uniforms
            <br />
            <span className="text-accent">Delivered to You</span>
          </h1>
          <p className="text-lg opacity-80 mb-6 max-w-xl">
            Your one-stop shop for school books, uniforms, and private study
            materials — with fast delivery.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Truck className="h-5 w-5" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Secure Orders</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">Quality Products</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Phone className="h-5 w-5" />
              <span className="text-sm font-medium">COD &amp; UPI</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <ProductSection
        title="Books"
        category={ProductCategory.books}
        icon={<BookOpen className="h-5 w-5" />}
      />
      <ProductSection
        title="School Uniforms"
        category={ProductCategory.schoolUniforms}
        icon={<Shirt className="h-5 w-5" />}
      />
      <ProductSection
        title="Private Books"
        category={ProductCategory.privateBooks}
        icon={<BookOpen className="h-5 w-5" />}
      />

      {/* Book Request Form */}
      <BookRequestForm />
    </div>
  );
}
