import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ProductInput {
    name: string;
    description: string;
    stock: bigint;
    category: ProductCategory;
    price: bigint;
}
export type Time = bigint;
export interface OrderItem {
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface ShopSettings {
    shippingAmount: bigint;
    gstPercent: bigint;
    gstEnabled: boolean;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    userId: Principal;
    createdAt: Time;
    totalAmount: bigint;
    items: Array<OrderItem>;
    phoneNumber: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    id: bigint;
    name: string;
    createdAt: Time;
    description: string;
    stock: bigint;
    category: ProductCategory;
    image?: ExternalBlob;
    price: bigint;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered",
    processing = "processing"
}
export enum PaymentMethod {
    upiOnDelivery = "upiOnDelivery",
    cashOnDelivery = "cashOnDelivery"
}
export enum ProductCategory {
    schoolUniforms = "schoolUniforms",
    books = "books"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    addProductWithToken(token: string, product: Product): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteProductWithToken(token: string, id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllOrdersWithToken(token: string): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product | null>;
    getShopSettings(): Promise<ShopSettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProducts(category: ProductCategory | null): Promise<Array<Product>>;
    placeOrder(deliveryAddress: string, phoneNumber: string, paymentMethod: PaymentMethod): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedProducts(token: string, products: Array<ProductInput>): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateOrderStatusWithToken(token: string, orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    updateProductWithToken(token: string, product: Product): Promise<void>;
    updateShopSettings(newSettings: ShopSettings): Promise<void>;
    updateShopSettingsWithToken(token: string, newSettings: ShopSettings): Promise<void>;
}
