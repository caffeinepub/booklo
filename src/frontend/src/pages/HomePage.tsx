import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronRight,
  Clock,
  GraduationCap,
  Lock,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";
import { ProductCategory } from "../hooks/useQueries";

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Fast Delivery",
    desc: "Same-day delivery in most cities",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "100% Authentic",
    desc: "Genuine products guaranteed",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Track Orders",
    desc: "Real-time order tracking",
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "Best Prices",
    desc: "Competitive prices every day",
  },
];

export default function HomePage() {
  const { navigate } = useApp();
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.slice(0, 6) ?? [];

  const [bookRequestForm, setBookRequestForm] = useState({
    name: "",
    phone: "",
    details: "",
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleBookRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !bookRequestForm.name.trim() ||
      !bookRequestForm.phone.trim() ||
      !bookRequestForm.details.trim()
    ) {
      toast.error("Please fill all fields before submitting");
      return;
    }
    setIsSubmittingRequest(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmittingRequest(false);
    toast.success("Request submitted! We'll contact you soon.");
    setBookRequestForm({ name: "", phone: "", details: "" });
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero Section ── */}
      <section className="relative gradient-navy text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, oklch(0.72 0.18 60 / 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, oklch(0.58 0.18 240 / 0.3) 0%, transparent 50%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-8 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight">
              Books &amp; Uniforms,{" "}
              <span className="text-gradient-amber">Delivered Fast!</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-md">
              Order textbooks, storybooks, and school uniforms from the comfort
              of your home. We deliver to your doorstep — fast, reliable, and
              affordable.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gradient-amber border-0 text-primary-foreground shadow-amber font-bold text-base px-8"
                onClick={() => navigate("products")}
              >
                Shop Now <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 font-semibold text-base"
                onClick={() => navigate("products")}
              >
                View All Products
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-navy ring-1 ring-white/10">
              <img
                src="/assets/generated/hero-banner.dim_1200x400.jpg"
                alt="Books and School Uniforms"
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
            </div>
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 3,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 bg-card rounded-xl p-3 shadow-card-hover"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  30 min delivery
                </span>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-4 -left-4 bg-card rounded-xl p-3 shadow-card-hover"
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span className="text-xs font-bold text-foreground">
                  4.9 Rating
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-2">
            Shop by Category
          </h2>
          <p className="text-muted-foreground mb-8">
            Find exactly what you need for school
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Books card */}
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("products")}
              className="group relative rounded-2xl overflow-hidden bg-secondary text-left shadow-navy"
              data-ocid="home.books_category_button"
            >
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-400 to-transparent" />
              <div className="relative p-8 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-xl gradient-amber flex items-center justify-center shadow-amber mb-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white">
                    Books
                  </h3>
                  <p className="text-white/70 text-sm">
                    Textbooks, novels, storybooks & more
                  </p>
                  <div className="flex items-center gap-1 text-primary font-semibold text-sm pt-2">
                    Explore Books{" "}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="text-8xl opacity-20 font-display font-black text-white select-none">
                  📚
                </div>
              </div>
            </motion.button>

            {/* Uniforms card */}
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("products")}
              className="group relative rounded-2xl overflow-hidden text-left"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 60), oklch(0.65 0.2 45))",
              }}
              data-ocid="home.uniforms_category_button"
            >
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />
              <div className="relative p-8 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white">
                    School Uniforms
                  </h3>
                  <p className="text-white/80 text-sm">
                    Shirts, trousers, ties & accessories
                  </p>
                  <div className="flex items-center gap-1 text-white font-semibold text-sm pt-2">
                    Explore Uniforms{" "}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="text-8xl opacity-20 font-display font-black text-white select-none">
                  🎒
                </div>
              </div>
            </motion.button>

            {/* Private Books card */}
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("products")}
              className="group relative rounded-2xl overflow-hidden text-left sm:col-span-2 lg:col-span-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.42 0.18 295), oklch(0.35 0.2 280))",
              }}
              data-ocid="home.private_books_category_button"
            >
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />
              {/* Decorative shimmer */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 80% 20%, oklch(0.85 0.1 295 / 0.8) 0%, transparent 50%)",
                }}
              />
              <div className="relative p-8 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 shadow-lg">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-2xl text-white">
                      Private Books
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/30">
                      10% OFF
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Exclusive &amp; premium book collection
                  </p>
                  <div className="flex items-center gap-1 text-purple-200 font-semibold text-sm pt-2">
                    Explore Private Books{" "}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="text-8xl opacity-20 font-display font-black text-white select-none">
                  🔒
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Features Strip ── */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="flex items-start gap-3"
              >
                <div className="h-10 w-10 rounded-xl gradient-amber flex items-center justify-center flex-shrink-0 shadow-amber">
                  <span className="text-white">{f.icon}</span>
                </div>
                <div>
                  <p className="font-display font-bold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-1">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Top picks for the new school year
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("products")}
            className="gap-2 font-semibold hidden sm:flex"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => i).map((i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-card rounded-2xl overflow-hidden shadow-card"
              >
                <Skeleton className="h-52 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="products.empty_state"
          >
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-display font-semibold text-lg">
              No products available yet
            </p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: {},
            }}
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigate("products")}
            className="gap-2 font-semibold"
          >
            View All Products <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Request a Book Section ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.04 240) 0%, oklch(0.22 0.06 235) 50%, oklch(0.20 0.05 240) 100%)",
        }}
      >
        {/* Decorative background elements */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 50%, oklch(0.72 0.18 60 / 0.6) 0%, transparent 40%), radial-gradient(circle at 90% 30%, oklch(0.65 0.15 240 / 0.4) 0%, transparent 40%)",
          }}
        />
        <div className="absolute top-6 right-6 text-9xl opacity-5 select-none font-display font-black text-white">
          📚
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium">
                <MessageSquarePlus className="h-4 w-4 text-primary" />
                Can't find what you need?
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                Request a Book <br />
                <span className="text-gradient-amber">We'll Source It!</span>
              </h2>
              <p className="text-white/70 leading-relaxed text-base">
                Don't see the book you're looking for? Submit a request and our
                team will try to source it for you. We cover textbooks, novels,
                reference books, and more.
              </p>
              <ul className="space-y-3">
                {[
                  "Any textbook or curriculum book",
                  "Novels, story books & non-fiction",
                  "Competitive exam preparation books",
                  "Rare & out-of-print editions",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-white/80 text-sm"
                  >
                    <div className="h-5 w-5 rounded-full gradient-amber flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <form
                onSubmit={handleBookRequest}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8 space-y-5"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="request-name"
                    className="text-white font-semibold text-sm"
                  >
                    Your Name *
                  </Label>
                  <Input
                    id="request-name"
                    placeholder="Enter your full name"
                    value={bookRequestForm.name}
                    onChange={(e) =>
                      setBookRequestForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/30 rounded-xl"
                    data-ocid="home.book_request.name_input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="request-phone"
                    className="text-white font-semibold text-sm"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="request-phone"
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={bookRequestForm.phone}
                    onChange={(e) =>
                      setBookRequestForm((f) => ({
                        ...f,
                        phone: e.target.value,
                      }))
                    }
                    required
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/30 rounded-xl"
                    data-ocid="home.book_request.phone_input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="request-details"
                    className="text-white font-semibold text-sm"
                  >
                    Book Title &amp; Details *
                  </Label>
                  <Textarea
                    id="request-details"
                    placeholder="Book title, author name, edition, publisher (if known)..."
                    value={bookRequestForm.details}
                    onChange={(e) =>
                      setBookRequestForm((f) => ({
                        ...f,
                        details: e.target.value,
                      }))
                    }
                    rows={4}
                    required
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-primary focus:ring-primary/30 resize-none rounded-xl"
                    data-ocid="home.book_request.details_textarea"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-amber border-0 text-primary-foreground shadow-amber font-bold gap-2 text-base"
                  disabled={isSubmittingRequest}
                  data-ocid="home.book_request.submit_button"
                >
                  {isSubmittingRequest ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Request
                    </>
                  )}
                </Button>

                <p className="text-white/50 text-xs text-center">
                  We'll contact you within 24 hours
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
