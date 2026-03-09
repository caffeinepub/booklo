import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    category : ProductCategory;
    price : Nat;
    image : ?Blob;
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
    phoneNumber : Text;
    status : OrderStatus;
    paymentMethod : PaymentMethod;
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

  type PaymentMethod = {
    #cashOnDelivery;
    #upiOnDelivery;
  };

  type UserProfile = {
    name : Text;
  };

  type ShopSettings = {
    shippingAmount : Nat;
    gstEnabled : Bool;
    gstPercent : Nat;
  };

  type OldActor = {
    productsMap : Map.Map<Nat, Product>;
    cartMap : Map.Map<Principal, List.List<CartItem>>;
    ordersMap : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    shopSettings : ShopSettings;
  };

  type NewProduct = {
    id : Nat;
    name : Text;
    description : Text;
    category : NewProductCategory;
    price : Nat;
    image : ?Blob;
    stock : Nat;
    createdAt : Time.Time;
  };

  type NewProductCategory = {
    #books;
    #schoolUniforms;
    #privateBooks;
  };

  type NewActor = {
    productsMap : Map.Map<Nat, NewProduct>;
    cartMap : Map.Map<Principal, List.List<CartItem>>;
    ordersMap : Map.Map<Nat, Order>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    shopSettings : ShopSettings;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    let newProductsMap = old.productsMap.map<Nat, Product, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          category =
            switch (oldProduct.category) {
              case (#books) { #books };
              case (#schoolUniforms) { #schoolUniforms };
            };
        };
      }
    );
    { old with productsMap = newProductsMap };
  };
};
