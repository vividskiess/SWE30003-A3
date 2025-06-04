import axios from 'axios';

// Export interfaces from User.tsx with corrected type for token
export interface UserData {
  uid?: number;
  account_type?: 'CUSTOMER' | 'STAFF'; // Made optional, will default to CUSTOMER
  first_name?: string;
  last_name?: string;
  gender?: 'M' | 'F';
  address?: IAddress,
  email?: string;
  password?: string;
}

export interface IAddress {
    street: string,
    city: string,
    state: string,
    postcode: string,
    country: string,
}

export interface AuthResponse {
  success: boolean;
  user?: UserData;
  token?: string; // Make sure this is string | undefined, not string | null
  message?: string;
}

// Forward declarations to avoid circular imports
declare class Customer extends User {}
declare class Staff extends User {}

export class User {
  // Make this protected so subclasses can access it
  protected static API_URL: string = "http://localhost:3000";
  private static currentUser: User | null = null;
  private static authToken: string | undefined = undefined; // Changed from null to undefined

  // Properties matching database fields
  protected uid: number | undefined;
  protected accountType: 'CUSTOMER' | 'STAFF';
  protected firstName: string;
  protected lastName: string;
  protected gender: 'M' | 'F';
  protected address: IAddress;
  protected email: string;
  
  constructor(userData: Partial<UserData> = {}) {
    console.log('Initializing User with data:', userData);
    
    // Initialize all properties with default values
    this.uid = userData.uid || undefined;
    this.accountType = (userData.account_type as 'CUSTOMER' | 'STAFF') || 'CUSTOMER';
    this.firstName = userData.first_name || '';
    this.lastName = userData.last_name || '';
    this.gender = (userData.gender as 'M' | 'F') || 'M';
    this.address = userData.address || {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: ''
    };
    this.email = userData.email || '';
    
    console.log('User initialized with:', {
      uid: this.uid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      accountType: this.accountType
    });
    // Note: Password is not stored directly on the instance after construction for security.
    // It's used for login/register and then discarded from the instance.
  }

  // Static methods for authentication
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${User.API_URL}/user/login`, { email, password });
      
      if (response.data.success) {
        // Create the appropriate user type based on account_type
        const userData = response.data.user;
        User.authToken = response.data.token;
        
        // We'll need to dynamically import to avoid circular dependencies
        if (userData.accountType === 'CUSTOMER') {
          // Dynamic import for Customer
          const { Customer } = await import('./Customer');
          User.currentUser = new Customer(userData);
        } else if (userData.accountType === 'STAFF') {
          // Dynamic import for Staff
          const { Staff } = await import('./Staff');
          User.currentUser = new Staff(userData);
        }
        
        // Store auth token in localStorage for persistence
        if (User.authToken) { // Add null check here
          localStorage.setItem('authToken', User.authToken);
        }
        
        return {
          success: true,
          user: userData,
          token: User.authToken
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network or server error'
      };
    }
  }

  static async register(userData: UserData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${User.API_URL}/user/register`, userData);
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Registration successful'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network or server error'
      };
    }
  }

  static logout(): void {
    User.currentUser = null;
    User.authToken = undefined; // Changed from null to undefined
    localStorage.removeItem('authToken');
  }

  static getCurrentUser(): User | null {
    return User.currentUser;
  }

  static isAuthenticated(): boolean {
    return !!User.currentUser;
  }

  // Instance methods
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  getEmail(): string {
    return this.email || '';
  }
  
  getUid(): number | undefined {
    return this.uid;
  }

  getAccountType(): 'CUSTOMER' | 'STAFF' {
    return this.accountType;
  }

  isStaff(): boolean {
    return this.accountType === 'STAFF';
  }

  isCustomer(): boolean {
    return this.accountType === 'CUSTOMER';
  }

  // Method to update user profile
  async updateProfile(updates: Partial<UserData>): Promise<boolean> {
    console.log('Starting updateProfile with updates:', updates);
    
    // If we have a UID in updates, use that to update the instance UID
    if (updates.uid) {
      console.log('Updating UID from', this.uid, 'to', updates.uid);
      this.uid = updates.uid;
    }
    
    if (!this.uid) {
      console.error('Cannot update profile: No UID');
      return false;
    }
    
    console.log('Current user state before update:', {
      uid: this.uid,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      accountType: this.accountType
    });

    try {
      // Log the incoming updates
      console.log('Updating profile with:', updates);
      
      // Create a new object with both camelCase and snake_case properties
      const updateData: Record<string, any> = { ...updates };
      
      // Map snake_case to camelCase
      if ('first_name' in updateData) {
        updateData.firstName = updateData.first_name;
      }
      if ('last_name' in updateData) {
        updateData.lastName = updateData.last_name;
      }
      if ('account_type' in updateData) {
        updateData.accountType = updateData.account_type;
      }

      // Only make API call if we have a token
      if (User.authToken) {
        const response = await axios.put(
          `${User.API_URL}/user/update/${this.uid}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${User.authToken}`
            }
          }
        );

        if (!response.data.success) {
          console.error('API update failed:', response.data);
          return false;
        }
      }

      // Update local properties
      if ('firstName' in updateData) this.firstName = updateData.firstName || '';
      if ('lastName' in updateData) this.lastName = updateData.lastName || '';
      if ('email' in updateData) this.email = updateData.email || '';
      if ('gender' in updateData) this.gender = (updateData.gender as 'M' | 'F') || 'M';
      if ('address' in updateData) this.address = updateData.address || null;
      if ('accountType' in updateData) this.accountType = (updateData.accountType as 'CUSTOMER' | 'STAFF') || 'CUSTOMER';
      if ('uid' in updateData) this.uid = updateData.uid;

      console.log('Profile updated successfully. Current state:', {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        accountType: this.accountType
      });

      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  // For demonstration purposes - simulates API call with mock data
  // static async simulateLogin(email: string, password: string): Promise<any> {
    // return new Promise(async (resolve) => {
    //   setTimeout(async () => {
    //     // Demo credentials
    //     if (email === 'demo@example.com' && password === 'password123') {
    //       const userData: UserData = {
    //         uid: 1,
    //         account_type: 'CUSTOMER',
    //         first_name: 'John',
    //         last_name: 'Doe',
    //         gender: 'M',
    //         address: '123 Main St, Melbourne, VIC',
    //         email: 'demo@example.com'
    //       };
          
    //       // Create Customer instance with dynamic import
    //       const { Customer } = await import('./Customer');
    //       User.currentUser = new Customer(userData);
    //       User.authToken = 'mock-auth-token-123';
          
    //       // Store in localStorage
    //       localStorage.setItem('authToken', User.authToken);
          
    //       resolve({
    //         success: true,
    //         user: userData,
    //         token: User.authToken
    //       });
    //     } else if (email === 'staff@example.com' && password === 'password123') {
    //       const userData: UserData = {
    //         uid: 2,
    //         account_type: 'STAFF',
    //         first_name: 'Jane',
    //         last_name: 'Smith',
    //         gender: 'F',
    //         address: '456 Admin St, Melbourne, VIC',
    //         email: 'staff@example.com'
    //       };
          
    //       // Create Staff instance with dynamic import
    //       const { Staff } = await import('./Staff');
    //       User.currentUser = new Staff(userData);
    //       User.authToken = 'mock-auth-token-456';
          
    //       // Store in localStorage
    //       localStorage.setItem('authToken', User.authToken);
          
    //       resolve({
    //         success: true,
    //         user: userData,
    //         token: User.authToken
    //       });
    //     } else {
    //       resolve({
    //         success: false,
    //         message: 'Invalid email or password'
    //       });
    //     }
    //   }, 1000); // Simulate network delay
    // });
  // }

  // For demonstration purposes - simulates API call with mock data
  static simulateRegister(userData: UserData): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if email is already used (in a real app, this would be a DB check)
        if (userData.email === 'demo@example.com' || userData.email === 'staff@example.com') {
          resolve({
            success: false,
            message: 'Email already in use'
          });
        } else {
          resolve({
            success: true,
            message: 'Registration successful'
          });
        }
      }, 1500); // Simulate network delay
    });
  }
}
