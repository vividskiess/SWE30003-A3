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
  
  constructor(userData: Partial<StaffData> = {}) {
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
}