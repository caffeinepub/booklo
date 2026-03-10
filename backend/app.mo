import Array "mo:base/Array";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor BookLo {

  // ---- Types ----

  type Category = { #Books; #SchoolUniforms; #PrivateBooks };

  type Product = {
    id : Text;
    name : Text;
    category : Category;
    description : ?Text;
    price : Nat;
    stock : Nat;
    uniformSize : ?Text;
    bookClass : ?Text;
  };

  type OrderItem = {
    productId : Text;
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    id : Text;
    customerName : Text;
    phone : Text;
    address : Text;
    items : [OrderItem];
    subtotal : Nat;
    shippingAmount : Nat;
    gstAmount : Nat;
    discountAmount : Nat;
    total : Nat;
    paymentMethod : Text;
    status : Text;
    timestamp : Int;
  };

  type BookRequest = {
    id : Text;
    bookName : Text;
    author : Text;
    bookClass : Text;
    notes : ?Text;
    phone : Text;
    timestamp : Int;
  };

  type Settings = {
    shippingAmount : Nat;
    gstEnabled : Bool;
    gstRate : Nat;
  };

  // ---- Stable Storage ----

  stable var productEntries : [(Text, Product)] = [];
  stable var orderEntries : [(Text, Order)] = [];
  stable var bookRequestEntries : [(Text, BookRequest)] = [];
  stable var settingsShipping : Nat = 50;
  stable var settingsGstEnabled : Bool = true;
  stable var settingsGstRate : Nat = 18;
  stable var nextId : Nat = 1;

  // ---- In-memory Maps ----

  var products = HashMap.fromIter<Text, Product>(productEntries.vals(), 16, Text.equal, Text.hash);
  var orders = HashMap.fromIter<Text, Order>(orderEntries.vals(), 16, Text.equal, Text.hash);
  var bookRequests = HashMap.fromIter<Text, BookRequest>(bookRequestEntries.vals(), 16, Text.equal, Text.hash);

  // ---- Upgrade Hooks ----

  system func preupgrade() {
    productEntries := Iter.toArray(products.entries());
    orderEntries := Iter.toArray(orders.entries());
    bookRequestEntries := Iter.toArray(bookRequests.entries());
  };

  system func postupgrade() {
    products := HashMap.fromIter<Text, Product>(productEntries.vals(), 16, Text.equal, Text.hash);
    orders := HashMap.fromIter<Text, Order>(orderEntries.vals(), 16, Text.equal, Text.hash);
    bookRequests := HashMap.fromIter<Text, BookRequest>(bookRequestEntries.vals(), 16, Text.equal, Text.hash);
  };

  // ---- Helpers ----

  let ADMIN_PASSWORD = "Naitik20510";

  func isAdmin(token : Text) : Bool {
    token == ADMIN_PASSWORD
  };

  func genId() : Text {
    let id = nextId;
    nextId += 1;
    Nat.toText(id)
  };

  // ---- Admin Auth ----

  public query func adminLogin(password : Text) : async Bool {
    password == ADMIN_PASSWORD
  };

  // ---- Products ----

  public func addProduct(
    adminToken : Text,
    name : Text,
    category : Category,
    description : ?Text,
    price : Nat,
    stock : Nat,
    uniformSize : ?Text,
    bookClass : ?Text
  ) : async { #ok : Text; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    let id = genId();
    let product : Product = { id; name; category; description; price; stock; uniformSize; bookClass };
    products.put(id, product);
    #ok(id)
  };

  public func updateProduct(
    adminToken : Text,
    id : Text,
    name : Text,
    category : Category,
    description : ?Text,
    price : Nat,
    stock : Nat,
    uniformSize : ?Text,
    bookClass : ?Text
  ) : async { #ok; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    switch (products.get(id)) {
      case null #err("Product not found");
      case (?_) {
        let product : Product = { id; name; category; description; price; stock; uniformSize; bookClass };
        products.put(id, product);
        #ok
      };
    }
  };

  public func deleteProduct(adminToken : Text, id : Text) : async { #ok; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    switch (products.remove(id)) {
      case null #err("Not found");
      case (?_) #ok;
    }
  };

  public query func getProducts() : async [Product] {
    Iter.toArray(products.vals())
  };

  // ---- Orders ----

  public func placeOrder(
    customerName : Text,
    phone : Text,
    address : Text,
    items : [OrderItem],
    subtotal : Nat,
    shippingAmount : Nat,
    gstAmount : Nat,
    discountAmount : Nat,
    total : Nat,
    paymentMethod : Text
  ) : async { #ok : Text; #err : Text } {
    let id = genId();
    let order : Order = {
      id; customerName; phone; address; items;
      subtotal; shippingAmount; gstAmount; discountAmount; total;
      paymentMethod; status = "Pending"; timestamp = Time.now()
    };
    orders.put(id, order);
    #ok(id)
  };

  public query func getOrders(adminToken : Text) : async { #ok : [Order]; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    #ok(Iter.toArray(orders.vals()))
  };

  public func updateOrderStatus(adminToken : Text, orderId : Text, status : Text) : async { #ok; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    switch (orders.get(orderId)) {
      case null #err("Order not found");
      case (?o) {
        let updated : Order = {
          id = o.id; customerName = o.customerName; phone = o.phone; address = o.address;
          items = o.items; subtotal = o.subtotal; shippingAmount = o.shippingAmount;
          gstAmount = o.gstAmount; discountAmount = o.discountAmount; total = o.total;
          paymentMethod = o.paymentMethod; status; timestamp = o.timestamp
        };
        orders.put(orderId, updated);
        #ok
      };
    }
  };

  // ---- Book Requests ----

  public func submitBookRequest(
    bookName : Text,
    author : Text,
    bookClass : Text,
    notes : ?Text,
    phone : Text
  ) : async { #ok : Text; #err : Text } {
    let id = genId();
    let req : BookRequest = { id; bookName; author; bookClass; notes; phone; timestamp = Time.now() };
    bookRequests.put(id, req);
    #ok(id)
  };

  public query func getBookRequests(adminToken : Text) : async { #ok : [BookRequest]; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    #ok(Iter.toArray(bookRequests.vals()))
  };

  // ---- Settings ----

  public query func getSettings() : async Settings {
    { shippingAmount = settingsShipping; gstEnabled = settingsGstEnabled; gstRate = settingsGstRate }
  };

  public func updateSettings(adminToken : Text, shippingAmount : Nat, gstEnabled : Bool, gstRate : Nat) : async { #ok; #err : Text } {
    if (not isAdmin(adminToken)) return #err("Unauthorized");
    settingsShipping := shippingAmount;
    settingsGstEnabled := gstEnabled;
    settingsGstRate := gstRate;
    #ok
  };

}
