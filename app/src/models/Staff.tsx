import { User, UserData } from './User';
import axios from 'axios';

// Extend UserData for Staff-specific fields
export interface StaffData extends UserData {
  department?: string;
  role?: string;
}

export class Staff extends User {
  // Staff-specific properties
  private department: string;
  private role: string;
  
  constructor(userData: StaffData) {
    super(userData);
    this.department = userData.department || 'General';
    this.role = userData.role || 'Staff';
  }
  
  // Staff-specific methods
  getDepartment(): string {
    return this.department;
  }
  
  getRole(): string {
    return this.role;
  }
  
  // Administrative methods
  async getAllUsers(): Promise<UserData[]> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Not authorized');
    }
    
    try {
      const response = await axios.get(`${User.API_URL}/user/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  // Method to update product information (simplified)
  async updateProduct(productId: string, updates: any): Promise<boolean> {
    // This would call a product API endpoint in a real app
    console.log('Staff updating product:', productId, updates);
    return true;
  }
  
  // For demonstration purposes - simulates API call with mock data
  simulateGetAllUsers(): Promise<UserData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            uid: 1,
            accountType: 'CUSTOMER',
            firstName: 'John',
            lastName: 'Doe',
            gender: 'M',
            address: '123 Main St, Melbourne, VIC',
            email: 'john.doe@example.com'
          },
          {
            uid: 2,
            accountType: 'STAFF',
            firstName: 'Jane',
            lastName: 'Smith',
            gender: 'F',
            address: '456 Admin St, Melbourne, VIC',
            email: 'jane.smith@example.com'
          },
          // More mock users...
        ]);
      }, 1000);
    });
  }
}