import { sharedCart, sharedCatalogue } from './index';
import { Product } from './Product';

// Simple debounce function for class methods
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export type CartItemWithProduct = {
  product: Product;
  quantity: number;
};

export class CheckoutManagerTest {
  private isPaymentFormValid: boolean = false;
  private isShippingFormValid: boolean = false;
  private notifyValidityChange: (isValid: boolean) => void = () => {};
  
  // Debounced version of the validity change notifier
  private debouncedNotifyValidityChange = debounce((isValid: boolean) => {
    this.notifyValidityChange(isValid);
  }, 100);

  constructor() {
    this.handlePaymentFormValidityChange = this.handlePaymentFormValidityChange.bind(this);
    this.handleShippingFormValidityChange = this.handleShippingFormValidityChange.bind(this);
  }

  public setValidityChangeCallback(callback: (isValid: boolean) => void): void {
    this.notifyValidityChange = callback;
  }

  public getCartItems(): CartItemWithProduct[] {
    return sharedCart.getItems()
      .map(([productId, quantity]) => ({
        product: sharedCatalogue.getProducts().find(p => String(p.id) === productId) as Product,
        quantity: quantity as number
      }))
      .filter((item): item is CartItemWithProduct => item.product !== undefined);
  }

  public calculateSubtotal(): number {
    return this.getCartItems().reduce((total: number, { product, quantity }) => {
      return total + (product.price * quantity);
    }, 0);
  }

  public handlePaymentFormValidityChange = (isValid: boolean): void => {
    this.isPaymentFormValid = isValid;
    this.checkValidity();
  };

  public handleShippingFormValidityChange = (isValid: boolean): void => {
    this.isShippingFormValid = isValid;
    this.checkValidity();
  };

  public isCheckoutValid(): boolean {
    return this.isPaymentFormValid && this.isShippingFormValid && this.getCartItems().length > 0;
  }

  private checkValidity(): void {
    this.debouncedNotifyValidityChange(this.isCheckoutValid());
  }
}

// Export a singleton instance
export const checkoutManager = new CheckoutManagerTest();