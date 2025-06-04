import { User, UserData } from './User';

// Extend UserData for Customer-specific fields
export interface CustomerData extends UserData {
  savedAddresses?: string[];
  orderHistory?: string[];
}

export class Customer extends User {
  // Customer-specific properties
  private savedAddresses: string[] = [];
  private orderHistory: string[] = [];
  
  constructor(userData: Partial<CustomerData> = {}) {
    super(userData); // Pass even an empty object to User constructor for its defaults
    this.savedAddresses = userData.savedAddresses || [];
    this.orderHistory = userData.orderHistory || [];
  }
  
  // Customer-specific methods
  getSavedAddresses(): string[] {
    return [...this.savedAddresses];
  }

  getCustomerDetails(): UserData {
    return {
      uid: this.uid,
      account_type: this.accountType,
      first_name: this.firstName,
      last_name: this.lastName,
      gender: this.gender,
      address: this.address,
      email: this.email,
    }
  }
  
  getOrderHistory(): string[] {
    return [...this.orderHistory];
  }
  
  async addAddress(address: string): Promise<boolean> {
    // In a real app, this would make an API call to update the database
    if (!this.savedAddresses.includes(address)) {
      this.savedAddresses.push(address);
      return true;
    }
    return false;
  }
  
  // Method to place an order (simplified)
  async placeOrder(orderDetails: any): Promise<boolean> {
    // This would call an order API endpoint in a real app
    console.log('Customer placing order:', orderDetails);
    // For demo purposes, just add a placeholder order ID to history
    const orderId = `ORD-${Date.now()}`;
    this.orderHistory.push(orderId);
    return true;
  }
}
