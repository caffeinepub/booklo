import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Package, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";
import { ProductCategory } from "../hooks/useQueries";

type TabValue = "all" | "books" | "uniforms";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const { data: products, isLoading } = useProducts();

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeTab === "all" ||
        (activeTab === "books" && p.category === ProductCategory.books) ||
        (activeTab === "uniforms" &&
          p.category === ProductCategory.schoolUniforms);
      return matchSearch && matchCategory;
    });
  }, [products, search, activeTab]);

  const booksCount =
    products?.filter((p) => p.category === ProductCategory.books).length ?? 0;
  const uniformsCount =
    products?.filter((p) => p.category === ProductCategory.schoolUniforms)
      .length ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-2">
          All Products
        </h1>
        <p className="text-muted-foreground">
          {products?.length ?? 0} products available for delivery
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books, uniforms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border h-12 text-base rounded-xl"
          data-ocid="products.search_input"
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="mb-8"
      >
        <TabsList className="bg-muted/60 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="all"
            className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-card gap-2"
            data-ocid="products.all_tab"
          >
            <Package className="h-4 w-4" />
            All
            <span className="text-xs text-muted-foreground">
              ({products?.length ?? 0})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="books"
            className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-card gap-2"
            data-ocid="products.books_tab"
          >
            <BookOpen className="h-4 w-4" />
            Books
            <span className="text-xs text-muted-foreground">
              ({booksCount})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="uniforms"
            className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-card gap-2"
            data-ocid="products.uniforms_tab"
          >
            <GraduationCap className="h-4 w-4" />
            Uniforms
            <span className="text-xs text-muted-foreground">
              ({uniformsCount})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => i).map((i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-card rounded-2xl overflow-hidden shadow-card"
                  data-ocid="products.loading_state"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" data-ocid="products.empty_state">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-display font-semibold text-lg text-foreground">
                No products found
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Try a different search or category
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  data-ocid={`products.item.${i + 1}`}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
