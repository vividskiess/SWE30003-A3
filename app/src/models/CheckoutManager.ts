import { sharedCart, sharedCatalogue } from './index';
import { Product } from './Product';


export type CartItemWithProduct = {
  product: Product;
  quantity: number;
};

export class CheckoutManagerTest {
  private isPaymentFormValid: boolean = false;
  private isShippingFormValid: boolean = false;
  private notifyValidityChange: (isValid: boolean) => void = () => {};
  private lastValidity: boolean = false; // Initialize as false since no forms are valid initially

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
    const isValid = this.isCheckoutValid();
    if (this.lastValidity !== isValid) {
      this.lastValidity = isValid;
      this.notifyValidityChange(isValid);
    }
  }
}

// Export a singleton instance
export const checkoutManager = new CheckoutManagerTest();