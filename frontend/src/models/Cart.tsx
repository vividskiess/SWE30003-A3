import { StoreCatalogue } from "./StoreCatalogue";

export class Cart {
  private items: [string, number][] = [];

  // Add a product to cart
  addProduct(productId: string, quantity: number = 1): void {
    const existingItem = this.items.find(([id]) => id === productId);
    if (existingItem) {
      existingItem[1] += quantity;
    } else {
      this.items.push([productId, quantity]);
    }
  }

  // Remove a product from cart
  removeProduct(productId: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(([id]) => id !== productId);
    return this.items.length !== initialLength;
  }

  // Modify product quantity
  modifyQuantity(productId: string, quantity: number): boolean {
    const item = this.items.find(([id]) => id === productId);
    if (item && quantity > 0) {
      item[1] = quantity;
      return true;
    }
    return false;
  }

  // Get total price of all products in cart
  getTotalPrice(catalogue: StoreCatalogue): number {
    return Number(
      this.items
        .reduce((total, [productId, quantity]) => {
          const product = catalogue.getProducts().find(p => p.id === productId);
          return total + (product?.price || 0) * quantity;
        }, 0)
        .toFixed(2)
    );
  }

  // Get all items in cart
  getItems(): [string, number][] {
    return [...this.items];
  }

  // Clear cart
  clear(): void {
    this.items = [];
  }

  renderCart(): React.ReactElement {
    return (
      <h1>Hello World!</h1>
    );
  }
}