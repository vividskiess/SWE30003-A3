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
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  addProduct(product: Product): void {
    this.products.push(product);
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
      this.notifyUpdate();
      StoreManagement.updateProduct(product)
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
      StoreManagement.deleteProduct(productId).then((res) => console.log(res))
      this.notifyUpdate();
    }
    return removed;
  }

  // Update product quantity
  updateProductQuantity(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (product) {
      product.qty = quantity;
      StoreManagement.updateProduct(product)
      this.notifyUpdate();
      return true;
    }
    return false;
  }
}
