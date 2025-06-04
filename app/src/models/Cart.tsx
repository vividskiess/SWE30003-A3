import { StoreCatalogue } from "./StoreCatalogue";

export class Cart {
  private items: [string, number][] = []; // Array of [productId, quantity] tuples
  private listeners: (() => void)[] = []; // For notifying UI components when cart changes

  // Subscribe to cart changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of cart changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Add a product to cart - ENSURE ID IS STRING
  addProduct(productId: string | number, quantity: number = 1): void {
    // Convert ID to string to ensure consistent type
    const idString = String(productId);
    
    const existingItem = this.items.find(([id]) => id === idString);
    if (existingItem) {
      existingItem[1] += quantity;
    } else {
      this.items.push([idString, quantity]);
    }
    this.notifyListeners();
    console.log('Product added to cart:', idString, 'Quantity:', existingItem ? existingItem[1] : quantity);
  }

  // Remove a product from cart
  removeProduct(productId: string | number): boolean {
    // Convert ID to string for consistent comparison
    const idString = String(productId);
    
    const initialLength = this.items.length;
    this.items = this.items.filter(([id]) => id !== idString);
    const changed = this.items.length !== initialLength;
    
    if (changed) {
      this.notifyListeners();
      console.log('Product removed from cart:', idString);
    }
    
    return changed;
  }

  // Modify product quantity
  modifyQuantity(productId: string | number, quantity: number, catalogue?: StoreCatalogue): boolean {
    // Convert ID to string for consistent comparison
    const idString = String(productId);
    
    const item = this.items.find(([id]) => id === idString);
    
    if (item) {
      if (quantity <= 0) {
        // If quantity is zero or negative, remove the item
        return this.removeProduct(idString);
      } else if (catalogue) {
        // Check if we're increasing the quantity and if there's enough stock
        const product = catalogue.getProducts().find(p => String(p.id) === idString);
        if (product && quantity > item[1] && product.qty !== undefined && quantity > product.qty) {
          console.warn(`Cannot add more than ${product.qty} items of ${product.name} to cart`);
          return false;
        }
      }
      
      item[1] = quantity;
      this.notifyListeners();
      console.log('Product quantity modified:', idString, 'New quantity:', quantity);
      return true;
    }
    
    return false;
  }

  // Get total price of all products in cart
  getTotalPrice(catalogue: StoreCatalogue): number {
    return Number(
      this.items
        .reduce((total, [productId, quantity]) => {
          // Important: Convert ID to string for comparison
          const product = catalogue.getProducts().find(p => String(p.id) === productId);
          if (!product) {
            console.warn(`Product not found in catalogue: ${productId}`);
            return total;
          }
          return total + (product.price || 0) * quantity;
        }, 0)
        .toFixed(2)
    );
  }

  // Get number of items in cart (total quantity)
  getItemCount(): number {
    return this.items.reduce((count, [_, quantity]) => count + quantity, 0);
  }

  // Get all items in cart
  getItems(): [string, number][] {
    return [...this.items];
  }

  // Clear cart
  clear(): void {
    this.items = [];
    this.notifyListeners();
    console.log('Cart cleared');
  }

  // Get product details for all items in cart
  getProductsInCart(catalogue: StoreCatalogue): Array<{
    id: string;
    quantity: number;
    name: string;
    price: number;
    total: number;
  }> {
    return this.items.map(([productId, quantity]) => {
      const product = catalogue.getProducts().find(p => String(p.id) === productId);
      if (!product) {
        console.warn(`Product not found: ${productId}`);
        return null;
      }
      return {
        id: productId,
        quantity,
        name: product.name,
        price: product.price,
        total: product.price * quantity
      };
    }).filter(Boolean) as Array<{
      id: string;
      quantity: number;
      name: string;
      price: number;
      total: number;
    }>;
  }
}
