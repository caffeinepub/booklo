# BookLo

## Current State
App was previously built but draft expired. Rebuilding from scratch based on conversation history.

## Requested Changes (Diff)

### Add
- Uniform size field as numeric input (36, 38, 40, 42, etc.) — admin fills in manually, optional
- Book class field (optional, e.g. "Class 10") — appears only for Books/Private Books
- Shipping amount and GST toggle persisted in stable storage (survives restarts until manually changed)

### Modify
- Remove all image upload/storage from product management
- Remove all product image display from home page, catalog, and everywhere
- Uniform size is now a numeric field (not S/M/L/XL text) — admin types numbers like 36, 38, 40

### Remove
- Image upload feature for products
- Product image display anywhere in the UI

## Implementation Plan

### Backend
- Product type: id, name, category (Books | SchoolUniforms | PrivateBooks), description (opt), price, stock, uniformSize (opt Text for numbers like "36,38,40"), bookClass (opt Text)
- Order type: id, customerName, phone, address, items, subtotal, shipping, gst, discount, total, paymentMethod, status, timestamp
- BookRequest type: id, bookName, author, class, notes, phone
- Settings: shippingAmount (Nat), gstEnabled (Bool), gstRate (Nat) — stable storage
- Admin auth: password hash check (password = Naitik20510)
- APIs: addProduct, updateProduct, deleteProduct, getProducts, placeOrder, getOrders, updateOrderStatus, submitBookRequest, getBookRequests, getSettings, updateSettings, adminLogin

### Frontend
- Home page: hero banner, product catalog by category (no images), add to cart
- Cart: item list, quantities, totals
- Checkout: customer info form, order summary with subtotal/shipping/GST/discount, COD and UPI on Delivery
- Order tracking: order status page
- Book request form at bottom of home page
- Admin panel (password protected): products CRUD (no image), orders view, settings (shipping/GST), book requests view
- No product images anywhere
