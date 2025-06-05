import { StoreManagement } from '../server/api';
import { Product } from './Product';

export class StoreCatalogue {
  private products: Product[] = [];
  private updateCallback: (() => void) | undefined = undefined;

  // Set a callback to be called when products change
  setUpdateCallback(callback: (() => void) | undefined): void {
    this.updateCallback = callback;
  }

  private notifyUpdate(): void {
    // Save to localStorage through the shared instance
    this.saveToLocalStorage();
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  addProduct(product: Product): void {
    this.products.push(product);
    this.saveToLocalStorage();
    this.notifyUpdate();
  }

  clear(): void {
    this.products = [];
    this.notifyUpdate();
  }

  // Get all products in the catalogue
  getProducts(): Product[] {
    return [...this.products];
  }

  // Get a product by ID
  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  // Update product details
  // Frontend: catalogue.modifyProduct("product-id", { price: 19.99, description: "New description" });
  modifyProduct(productId: string, updates: Partial<Product>): boolean {
    const product = this.getProductById(productId);
  
    if (product) {
      Object.assign(product, updates);
      StoreManagement.updateProduct(product).then(() => {
        this.saveToLocalStorage();
      });
      this.notifyUpdate();
      return true;
    }
    return false;
  }

  // Remove a product
  // Frontend: catalogue.removeProduct("product-id");
  removeProduct(productId: string): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    const removed = this.products.length !== initialLength;

    if (removed) {
      StoreManagement.deleteProduct(productId).then(() => {
        this.saveToLocalStorage();
        this.notifyUpdate();
      });
    }
    return removed;
  }

  // Update product quantity
  updateProductQuantity(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (product) {
      product.qty = quantity;
      StoreManagement.updateProduct(product).then(() => {
        this.saveToLocalStorage();
      });
      this.notifyUpdate();
      return true;
    }
    return false;
  }

  private saveToLocalStorage(): void {
    try {
      // Use the same key as in index.ts
      localStorage.setItem('catalogue_products', JSON.stringify(this.products));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }
}
