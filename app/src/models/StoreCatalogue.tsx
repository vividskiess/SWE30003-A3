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

  // Generate a new unique ID by finding the first available number
  private generateNewId(): string {
    let id = 1;
    const existingIds = this.products.map(p => parseInt(p.id)).filter(id => !isNaN(id));
    
    // Sort numerically and find the first gap or next number
    existingIds.sort((a, b) => a - b);
    
    for (const existingId of existingIds) {
      if (id < existingId) {
        break; // Found a gap, use this ID
      }
      id = existingId + 1; // Move to next potential ID
    }
    
    return id.toString();
  }

  // Add a new product to the catalogue
  // If productData.id is not provided, a new ID will be generated automatically
  addProduct(productData: Omit<Product, 'id'> & { id?: string }): void {
    // Create a new Product instance with the generated ID
    const product = new Product(
      productData.id || this.generateNewId(),
      productData.name,
      productData.price,
      productData.description,
      productData.available,
      productData.qty
    );
    
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
      // Convert products to plain objects before saving
      const productsData = this.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        available: product.available,
        qty: product.qty
      }));
      localStorage.setItem('catalogue_products', JSON.stringify(productsData));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }

  // Load products from localStorage and convert them back to Product instances
  loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('catalogue_products');
      if (data) {
        const productsData = JSON.parse(data);
        this.products = productsData.map((productData: any) => 
          new Product(
            productData.id,
            productData.name,
            productData.price,
            productData.description,
            productData.available,
            productData.qty
          )
        );
        this.notifyUpdate();
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
    }
  }
}
