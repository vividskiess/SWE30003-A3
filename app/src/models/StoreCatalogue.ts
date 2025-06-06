import { storeManagement } from '../api';
import { Product } from './Product';

type ProductValidationErrors = {
  name?: string;
  price?: string;
  qty?: string;
  description?: string;
  _general?: string; // For general form errors
};

type ProductFormData = {
  id?: string;
  name: string;
  price: string | number;
  description: string;
  qty: string | number;
  available: boolean;
};

export class StoreCatalogue {
  private products: Product[] = [];
  private updateCallback: (() => void) | undefined = undefined;

  constructor() {
    // Bind methods to ensure 'this' is always correct
    this.addProduct = this.addProduct.bind(this);
    this.modifyProduct = this.modifyProduct.bind(this);
    this.removeProduct = this.removeProduct.bind(this);
    this.validateProduct = this.validateProduct.bind(this);
  }

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

  // Validate product data
  validateProduct = (productData: Partial<ProductFormData>): { isValid: boolean; errors: ProductValidationErrors } => {
    const errors: ProductValidationErrors = {};
    const { name, price, qty, description } = productData;

    if (!name || !name.toString().trim()) {
      errors.name = 'Product name is required';
    }

    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (price === undefined || price === '' || isNaN(priceNum as number) || (priceNum as number) <= 0) {
      errors.price = 'Please enter a valid price';
    }

    const qtyNum = typeof qty === 'string' ? parseInt(qty, 10) : qty;
    if (qty === undefined || qty === '' || isNaN(qtyNum as number) || !Number.isInteger(qtyNum) || (qtyNum as number) <= 0) {
      errors.qty = 'Please enter a valid quantity (whole number > 0)';
    }

    if (!description || !description.toString().trim()) {
      errors.description = 'Description is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Prepare product data for saving
  private prepareProductData(data: Partial<ProductFormData>): Omit<Product, 'id'> {
    return {
      name: data.name?.toString().trim() || '',
      description: data.description?.toString().trim() || '',
      price: typeof data.price === 'string' ? parseFloat(data.price) : (data.price as number) || 0,
      qty: typeof data.qty === 'string' ? parseInt(data.qty, 10) : (data.qty as number) || 0,
      available: data.available !== undefined ? data.available : true
    };
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
  addProduct = (productData: Omit<Product, 'id'> & { id?: string }): { success: boolean; product?: Product; errors?: ProductValidationErrors } => {
    // Initialize return object
    const result: { success: boolean; product?: Product; errors?: ProductValidationErrors } = { 
      success: false 
    };

    // Validate product data
    const validation = this.validateProduct(productData);
    if (!validation.isValid) {
      result.errors = validation.errors;
      return result;
    }

    try {
      // Create a new Product instance with the generated ID
      const product = new Product(
        productData.id || this.generateNewId(),
        productData.name,
        productData.price,
        productData.description,
        productData.available,
        productData.qty
      );
      // Update in the backend if available
      if (storeManagement && storeManagement.createProduct) {
        storeManagement.createProduct(product).catch(error => {
          console.error('Failed to update product in backend:', error);
        });
      }
      this.products.push(product);
      this.saveToLocalStorage();
      this.notifyUpdate();
      
      result.success = true;
      result.product = product;
      return result;
      
    } catch (error) {
      console.error('Error adding product:', error);
      result.errors = { 
        _general: 'Failed to add product. Please try again.' 
      };
      return result;
    }
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
  modifyProduct = (
    productId: string, 
    updates: Partial<ProductFormData>
  ): { success: boolean; product?: Product; errors?: ProductValidationErrors } => {
    // Initialize return object
    const result: { success: boolean; product?: Product; errors?: ProductValidationErrors } = { 
      success: false 
    };

    // Validate product data
    const validation = this.validateProduct(updates);
    if (!validation.isValid) {
      result.errors = validation.errors;
      return result;
    }

    const product = this.getProductById(productId);
    if (!product) {
      result.errors = { _general: 'Product not found' };
      return result;
    }

    try {
      // Prepare and apply updates
      const updatedData = this.prepareProductData(updates);
      Object.assign(product, updatedData);
      
      // Update in the backend if available
      if (storeManagement && storeManagement.updateProduct) {
        storeManagement.updateProduct(product).catch(error => {
          console.error('Failed to update product in backend:', error);
        });
      }
      
      this.saveToLocalStorage();
      this.notifyUpdate();
      
      result.success = true;
      result.product = product;
      return result;
      
    } catch (error) {
      console.error('Error updating product:', error);
      result.errors = { 
        _general: 'Failed to update product. Please try again.' 
      };
      return result;
    }
  }

  // Remove a product
  removeProduct = (productId: string): { success: boolean; error?: string } => {
    // Initialize return object
    const result: { success: boolean; error?: string } = { success: false };
    
    try {
      const initialLength = this.products.length;
      this.products = this.products.filter(p => p.id !== productId);
      const removed = this.products.length !== initialLength;

      if (!removed) {
        result.error = 'Product not found';
        return result;
      }

      // Remove from backend if available
      if (storeManagement && storeManagement.deleteProduct) {
        storeManagement.deleteProduct(Number(productId)).catch(error => {
          console.error('Failed to delete product from backend:', error);
        });
      }
      
      this.saveToLocalStorage();
      this.notifyUpdate();
      
      result.success = true;
      return result;
      
    } catch (error) {
      console.error('Error removing product:', error);
      result.error = 'Failed to remove product. Please try again.';
      return result;
    }
  }

  // Update product quantity
  updateProductQuantity(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (product) {
      product.qty = quantity;
      storeManagement.updateProduct(product).then(() => {
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
