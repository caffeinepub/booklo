import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  include MixinStorage();

  // Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    category : ProductCategory;
    price : Nat;
    image : ?Storage.ExternalBlob;
    stock : Nat;
    createdAt : Time.Time;
  };

  type ProductCategory = {
    #books;
    #schoolUniforms;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    deliveryAddress : Text;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  type OrderItem = {
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  public type UserProfile = {
    name : Text;
  };

  type ShopSettings = {
    shippingAmount : Nat;
    gstEnabled : Bool;
    gstPercent : Nat;
  };

  // Core state
  let productsMap = Map.empty<Nat, Product>();
  let cartMap = Map.empty<Principal, List.List<CartItem>>();
  let ordersMap = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 1;
  var nextOrderId = 1;
  var shopSettings : ShopSettings = {
    shippingAmount = 0;
    gstEnabled = false;
    gstPercent = 18;
  };

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  // Shop Settings APIs (New)
  public query ({ caller }) func getShopSettings() : async ShopSettings {
    shopSettings;
  };

  public shared ({ caller }) func updateShopSettings(newSettings : ShopSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    shopSettings := newSettings;
  };

  // User Profile APIs
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product APIs
  public query ({ caller }) func listProducts(category : ?ProductCategory) : async [Product] {
    productsMap.values().toArray().sort().filter(
      func(p) {
        switch (category) {
          case (null) { true };
          case (?cat) { p.category == cat };
        };
      }
    );
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    productsMap.get(id);
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let newProduct = {
      product with
      id = nextProductId;
      createdAt = Time.now();
    };
    productsMap.add(nextProductId, newProduct);
    nextProductId += 1;
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not productsMap.containsKey(product.id)) {
      Runtime.trap("Product not found");
    };
    productsMap.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not productsMap.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    productsMap.remove(id);
  };

  // Cart APIs
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let cart = switch (cartMap.get(caller)) { case (null) { List.empty<CartItem>() }; case (?c) { c } };
    cart.add({ productId; quantity });
    cartMap.add(caller, cart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (cartMap.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };
    cartMap.remove(caller);
  };

  // Order APIs
  public shared ({ caller }) func placeOrder(deliveryAddress : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let cart = switch (cartMap.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) { c };
    };

    if (cart.isEmpty()) { Runtime.trap("Cart is empty") };

    let itemsIter = cart.toArray().values();
    var totalAmount = 0;
    let orderItems = itemsIter.map(
      func(item) {
        switch (productsMap.get(item.productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?product) {
            totalAmount += product.price * item.quantity;
            {
              productName = product.name;
              quantity = item.quantity;
              price = product.price;
            };
          };
        };
      }
    ).toArray();

    let order = {
      id = nextOrderId;
      userId = caller;
      items = orderItems;
      totalAmount;
      deliveryAddress;
      status = #pending;
      createdAt = Time.now();
    };

    ordersMap.add(nextOrderId, order);
    cartMap.remove(caller);
    nextOrderId += 1;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    ordersMap.values().toArray().filter(
      func(order) {
        order.userId == caller;
      }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    ordersMap.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let order = switch (ordersMap.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    let updatedOrder = { order with status };
    ordersMap.add(orderId, updatedOrder);
  };
};
