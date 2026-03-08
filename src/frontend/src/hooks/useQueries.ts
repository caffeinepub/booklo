import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CartItem,
  type Order,
  OrderStatus,
  PaymentMethod,
  type Product,
  ProductCategory,
  type ProductInput,
  type ShopSettings,
  type UserProfile,
  UserRole,
} from "../backend";
import { useActor } from "./useActor";

export { ProductCategory, OrderStatus, UserRole, PaymentMethod };
export type {
  Product,
  Order,
  CartItem,
  UserProfile,
  ShopSettings,
  ProductInput,
};

// ── Auth / User ─────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: isFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── Products ─────────────────────────────────────────

export function useProducts(category: ProductCategory | null = null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProduct(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product | null>({
    queryKey: ["product", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      product,
    }: { token: string; product: Product }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addProductWithToken(token, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      product,
    }: { token: string; product: Product }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateProductWithToken(token, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteProductWithToken(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ── Cart ──────────────────────────────────────────────

export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: bigint;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// ── Orders ────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      deliveryAddress,
      phoneNumber,
      paymentMethod,
    }: {
      deliveryAddress: string;
      phoneNumber: string;
      paymentMethod: PaymentMethod;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.placeOrder(deliveryAddress, phoneNumber, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders(token: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders", token],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrdersWithToken(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      orderId,
      status,
    }: {
      token: string;
      orderId: bigint;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateOrderStatusWithToken(token, orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// ── Shop Settings ─────────────────────────────────────

export function useShopSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<ShopSettings>({
    queryKey: ["shopSettings"],
    queryFn: async () => {
      if (!actor)
        return { shippingAmount: 0n, gstEnabled: false, gstPercent: 18n };
      return actor.getShopSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUpdateShopSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: ShopSettings) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateShopSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopSettings"] });
    },
  });
}

export function useSeedProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      products,
    }: {
      token: string;
      products: Array<ProductInput>;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.seedProducts(token, products);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateShopSettingsWithToken() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      settings,
    }: {
      token: string;
      settings: ShopSettings;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateShopSettingsWithToken(token, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopSettings"] });
    },
  });
}
