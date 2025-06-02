import { Product } from './Product';

type ShippingInfo = {
  streetAddress: string;
  town: string;
  state: string;
  postcode: string;
  country: string;
};

type PaymentInfo = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

type OrderItem = {
  product: Product;
  quantity: number;
  price: number;
};

export class Order {
  private items: OrderItem[] = [];
  private shippingInfo: ShippingInfo | null = null;
  private paymentInfo: PaymentInfo | null = null;
  private orderDate: Date = new Date();
  private orderId: string;
  private status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'pending';
  private shippingCost: number = 0;
  private shippingOption: {
    name: string;
    companyName: string;
    estimatedDays: string;
  } | null = null;

  constructor() {
    this.orderId = this.generateOrderId();
  }

  // Add items to the order
  public addItems(products: { product: Product; quantity: number }[]): void {
    this.items = products.map(({ product, quantity }) => ({
      product,
      quantity,
      price: product.price * quantity
    }));
  }

  // Set shipping information
  public setShippingInfo(info: ShippingInfo): void {
    this.shippingInfo = { ...info };
  }

  // Set payment information
  public setPaymentInfo(info: PaymentInfo): void {
    this.paymentInfo = { ...info };
  }

  // Calculate subtotal
  public calculateSubtotal(): number {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  // Calculate total (including potential shipping costs, taxes, etc.)
  public calculateTotal(): number {
    // Return subtotal plus shipping cost
    return this.calculateSubtotal() + this.shippingCost;
  }
  
  // Set shipping cost
  public setShippingCost(cost: number): void {
    this.shippingCost = cost;
  }
  
  // Set shipping option details
  public setShippingOption(option: {
    name: string;
    companyName: string;
    estimatedDays: string;
  }): void {
    this.shippingOption = option;
  }

  // Get order summary for display
  public getOrderSummary() {
    return {
      orderId: this.orderId,
      orderDate: this.orderDate,
      status: this.status,
      items: this.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.product.price
      })),
      subtotal: this.calculateSubtotal(),
      total: this.calculateTotal(),
      shippingCost: this.shippingCost,
      shippingInfo: this.shippingInfo,
      shippingOption: this.shippingOption,
      // Mask sensitive payment info
      paymentInfo: this.paymentInfo ? {
        cardNumber: `•••• •••• •••• ${this.paymentInfo.cardNumber.slice(-4)}`,
        expiryDate: this.paymentInfo.expiryDate
      } : null
    };
  }

  // Submit the order
  public submitOrder(): boolean {
    if (!this.shippingInfo || !this.paymentInfo || this.items.length === 0) {
      return false;
    }
    this.status = 'processing';
    // Here you would typically send the order to a server
    return true;
  }

  // Update order status
  public updateStatus(status: 'processing' | 'shipped' | 'delivered' | 'cancelled'): void {
    this.status = status;
  }

  // Generate a simple order ID (can be enhanced as needed)
  private generateOrderId(): string {
    return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  // Get order status
  public getStatus(): string {
    return this.status;
  }
}

// Create a shared instance
export const sharedOrder = new Order();

// // When the form is submitted
// const handleSubmit = () => {
//     // Add items to order
//     sharedOrder.addItems(items);
    
//     // Set shipping info
//     sharedOrder.setShippingInfo({
//       streetAddress: formData.streetAddress,
//       town: formData.town,
//       state: formData.state,
//       postcode: formData.postcode,
//       country: formData.country
//     });
    
//     // Set payment info
//     sharedOrder.setPaymentInfo({
//       cardNumber: formData.cardNumber,
//       expiryDate: formData.expiryDate,
//       cvv: formData.cvv
//     });
    
//     // Submit the order
//     const success = sharedOrder.submitOrder();
    
//     if (success) {
//       // Navigate to order confirmation page
//       navigate('/order-confirmation');
//     }
//   };