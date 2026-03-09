# BookLo

## Current State
The app has two product categories: `books` and `schoolUniforms`. Products are managed via the admin panel, and checkout calculates subtotal + shipping + optional GST. There is no category-based discount logic.

## Requested Changes (Diff)

### Add
- New product category `privateBooks` in the backend (`ProductCategory` type).
- 10% discount applied at checkout for items in the `privateBooks` category, shown as a separate line in the order summary.
- "Private Books" tab on the Products page.
- "Private Books" category card on the Home page.
- "Private Books" option in Admin panel's Add/Edit Product category dropdown.
- Badge display for `privateBooks` products in Admin products table.

### Modify
- `backend.d.ts` `ProductCategory` enum: add `privateBooks = "privateBooks"`.
- `backend/main.mo`: add `#privateBooks` variant to `ProductCategory` type.
- `CheckoutPage.tsx`: compute a `privateBookDiscount` (10% of subtotal of `privateBooks` items) and show it as a discount line; subtract from total.
- `ProductsPage.tsx`: add `privateBooks` filter tab.
- `HomePage.tsx`: add a third category card for Private Books.
- `AdminPage.tsx`: add `privateBooks` to category select and badge rendering.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `src/backend/main.mo` to add `#privateBooks` to the `ProductCategory` variant.
2. Update `src/frontend/src/backend.d.ts` to add `privateBooks = "privateBooks"` to the `ProductCategory` enum.
3. Update `CheckoutPage.tsx` to calculate and show 10% discount on `privateBooks` items, and adjust total accordingly.
4. Update `ProductsPage.tsx` to add a "Private Books" tab that filters by `ProductCategory.privateBooks`.
5. Update `HomePage.tsx` to add a third category card for Private Books.
6. Update `AdminPage.tsx` to include `privateBooks` in the category dropdown and badge rendering.
