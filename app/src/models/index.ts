import { Cart } from './Cart';
import { Product } from './Product';
import { StoreCatalogue } from './StoreCatalogue';
import { authentication, storeManagement } from '../server/api';
import { Customer } from './Customer';
import { Staff } from './Staff';
import { Order } from './Order';
import { User, UserData } from './User'; // Import User class

export * from './Cart';
export * from './Product';
export * from './StoreCatalogue';

// Simple function to create fresh instances
const createDefaultInstances = () => {
  const catalogue = new StoreCatalogue();
  const cart = new Cart();
  const customer = new Customer();
  const staff = new Staff();
  const order = new Order();
  
  return { catalogue, cart, customer, staff, order };
};

// Store for all users
export let allUsers: UserData[] | undefined = [];

// Function to save users to localStorage
const saveUsersToLocalStorage = (users: UserData[] | undefined) => {
  try {
    localStorage.setItem('app_users', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Function to load users from localStorage
const loadUsersFromLocalStorage = (): any[] => {
  try {
    const data = localStorage.getItem('app_users');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return [];
  }
};

// Function to update and save users
export const updateUsers = async (): Promise<void> => {
  try {
    const users: UserData[] | undefined = await authentication.getAllUsers();
    allUsers = users;
    saveUsersToLocalStorage(users);
  } catch (error) {
    console.error('Error updating users:', error);
    // Fallback to localStorage if API fails
    allUsers = loadUsersFromLocalStorage();
  }
};

// Function to add a new user to the array and save to localStorage
export const addUser = (user: UserData): void => {
  allUsers = [...(allUsers ?? []), user];
  saveUsersToLocalStorage(allUsers);
};

// Create fresh instances
const { 
  catalogue: freshCatalogue, 
  cart: freshCart, 
  customer: freshCustomer, 
  staff: freshStaff, 
  order: freshOrder 
} = createDefaultInstances();

// Export shared instances
export const sharedCatalogue = freshCatalogue;
export const sharedCart = freshCart;
export const sharedCustomer = freshCustomer;
export const sharedStaff = freshStaff;
export const sharedOrder = freshOrder;

// Make a function available in the browser console to clear storage
if (typeof window !== 'undefined') {
  (window as any).clearAppStorage = (options: { hardReset?: boolean } = {}) => {
    try {
      console.log('Clearing app storage...');
      
      // Clear localStorage
      localStorage.removeItem('cart');
      localStorage.removeItem('customer');
      localStorage.removeItem('staff');
      localStorage.removeItem('authToken');
      localStorage.removeItem('catalogue_products');
      
      // Clear shared instances
      Object.assign(sharedCart, new Cart());
      if (options.hardReset) {
        // Only reset customer/staff if hard reset is requested
        Object.assign(sharedCustomer, new Customer());
        Object.assign(sharedStaff, new Staff());
        console.log('Storage cleared - hard reset complete');
        
        // Clear the current user in the User class
        User['currentUser'] = null;
        User['authToken'] = undefined;
      } else {
        console.log('Storage cleared - soft reset (customer/staff preserved)');
      }
      
      // Reload the page to ensure clean state
      if (options.hardReset) {
        window.location.reload();
      }
      
      return 'Storage cleared successfully';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error clearing storage:', error);
      return 'Error clearing storage: ' + errorMessage;
    }
  };
  
  console.log('You can clear app storage by running: clearAppStorage() or clearAppStorage({ hardReset: true })');
}

// Load data from localStorage and merge with fresh instances
const loadData = async () => {
  try {
    // Load cart
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      // Save the current listeners
      const currentListeners = [...sharedCart['listeners'] || []];
      // Load the cart data
      const parsedCart = JSON.parse(cartData);
      // Restore the listeners
      parsedCart.listeners = currentListeners;
      Object.assign(sharedCart, parsedCart);
    }

    // Load auth token if exists
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Set the token in the User class first
        User['authToken'] = token;
        
        // Try to fetch current user data using the token
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Import the necessary classes to avoid circular dependencies
          if (userData.account_type === 'STAFF') {
            // If staff, update sharedStaff
            const staffData = {
              ...userData,
              account_type: 'STAFF' as const
            };
            Object.assign(sharedStaff, staffData);
            // Set the current user in the User class
            User['currentUser'] = sharedStaff;
          } else {
            // If customer, update sharedCustomer
            const customerData = {
              ...userData,
              account_type: 'CUSTOMER' as const
            };
            Object.assign(sharedCustomer, customerData);
            // Set the current user in the User class
            User['currentUser'] = sharedCustomer;
          }
        } else {
          // If token is invalid, clear it
          console.error('Invalid token, removing from storage');
          localStorage.removeItem('authToken');
          User['authToken'] = undefined;
          User['currentUser'] = null;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('authToken');
        User['authToken'] = undefined;
        User['currentUser'] = null;
      }
    }

    // Load catalogue products using the class method
    sharedCatalogue.loadFromLocalStorage();

  } catch (e) {
    console.error('Error loading data from localStorage:', e);
  }
};

// Initial data load
loadData();

// Load users on startup
updateUsers().catch(console.error);

// Save data to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    // For cart, we want to save items but not listeners
    if (key === 'cart') {
      const { listeners, ...cartData } = data;
      localStorage.setItem(key, JSON.stringify(cartData));
    } 
    // For customer/staff, save the user data
    else if (key === 'customer' || key === 'staff') {
      // Only save the data properties, not methods
      const userData = {
        uid: data.uid,
        email: data.email,
        first_name: data.firstName || data.first_name,
        last_name: data.lastName || data.last_name,
        gender: data.gender,
        address: data.address,
        account_type: data.accountType || data.account_type,
        // Add any other relevant user properties here
      };
      localStorage.setItem(key, JSON.stringify(userData));
    }
    // For catalogue, save products array
    else if (key === 'catalogue_products') {
      localStorage.setItem(key, JSON.stringify(data.products || []));
    }
  } catch (e) {
    console.error(`Error saving to localStorage (${key}):`, e);
  }
};

// Save user data to localStorage
const saveUserData = (user: any) => {
  if (!user) return;
  
  const userData = {
    uid: user.uid,
    email: user.email,
    first_name: user.firstName || user.first_name,
    last_name: user.lastName || user.last_name,
    gender: user.gender,
    address: user.address,
    account_type: user.accountType || user.account_type,
  };
  
  // Save to appropriate key based on account type
  const key = user.accountType === 'STAFF' ? 'staff' : 'customer';
  localStorage.setItem(key, JSON.stringify(userData));
};

// Set up user data persistence
const setupUserPersistence = () => {
  // Save user data whenever it changes
  const saveUserDataOnChange = () => {
    const user = User['currentUser'] || sharedCustomer || sharedStaff;
    if (user) {
      saveUserData(user);
    }
  };

  // Initial save of user data
  const user = User['currentUser'] || sharedCustomer || sharedStaff;
  if (user) {
    saveUserData(user);
  }

  // Set up a timer to periodically check for changes
  setInterval(saveUserDataOnChange, 1000);
};

// Initialize user persistence
setupUserPersistence();

// Initialize catalog with products if empty
(async function initializeStore() {
  // console.log(await authentication.getAllUsers())
  if (sharedCatalogue.getProducts().length === 0) {
    console.log('Initializing store catalogue with products');
    
    try {
      // First try to load from the backend
      const products = await storeManagement.getAllProducts();
      console.log(products?.length)
      if (products && products.length > 0) {
        // Clear existing products and add new ones
        products.forEach((product: any) => {
          sharedCatalogue.addProduct(new Product(
            String(product.id),
            product.name,
            parseFloat(product.price),
            product.description || '',
            product.available ? true : false,
            product.qty || 0
          ));
        });
        console.log('Loaded products from backend:', products.length);
      } else {
        // Fallback to default products if backend is not available
        console.log('No products from backend, using default products');
        sharedCatalogue.addProduct(new Product(
          '1', 
          'Product 1', 
          10.99, 
          'Description 1', 
          true, 
          10
        ));
        sharedCatalogue.addProduct(new Product(
          '2', 
          'Product 2', 
          19.99, 
          'Description 2', 
          true, 
          5
        ));
      }
    } catch (error) {
      console.error('Error initializing store:', error);
      // Fallback to default products if there's an error
      sharedCatalogue.addProduct(new Product(
        '1', 
        'Product 1', 
        10.99, 
        'Description 1', 
        true, 
        10
      ));
      sharedCatalogue.addProduct(new Product(
        '2', 
        'Product 2', 
        19.99, 
        'Description 2', 
        true, 
        5
      ));
    }
  }
})();

// Set up auto-save for shared instances
const setupAutoSave = () => {
  // Get the Cart prototype
  const cartProto = Object.getPrototypeOf(sharedCart);
  const catalogueProto = Object.getPrototypeOf(sharedCatalogue);
  
  // Save cart when product is added
  const originalAddProduct = cartProto.addProduct;
  cartProto.addProduct = function(productId: string | number, quantity: number = 1): void {
    originalAddProduct.call(this, productId, quantity);
    saveToLocalStorage('cart', sharedCart);
  };
  
  // Save catalogue when product is added
  const originalCatalogueAddProduct = catalogueProto.addProduct;
  if (originalCatalogueAddProduct) {
    catalogueProto.addProduct = function(product: any): void {
      originalCatalogueAddProduct.call(this, product);
      saveToLocalStorage('catalogue_products', { products: sharedCatalogue.getProducts() });
    };
  }
  
  // Save catalogue when product is modified
  const originalModifyProduct = catalogueProto.modifyProduct;
  if (originalModifyProduct) {
    catalogueProto.modifyProduct = function(productId: string, updates: any): boolean {
      const result = originalModifyProduct.call(this, productId, updates);
      if (result) {
        saveToLocalStorage('catalogue_products', { products: sharedCatalogue.getProducts() });
      }
      return result;
    };
  }
  
  // Save catalogue when product is removed
  const originalCatalogueRemoveProduct = catalogueProto.removeProduct;
  if (originalCatalogueRemoveProduct) {
    catalogueProto.removeProduct = function(productId: string): boolean {
      const result = originalCatalogueRemoveProduct.call(this, productId);
      if (result) {
        saveToLocalStorage('catalogue_products', { products: sharedCatalogue.getProducts() });
      }
      return result;
    };
  }

  // Save cart when product is removed
  const originalRemoveProduct = cartProto.removeProduct;
  cartProto.removeProduct = function(productId: string | number): boolean {
    const result = originalRemoveProduct.call(this, productId);
    saveToLocalStorage('cart', sharedCart);
    return result;
  };

  // Save cart when quantity is modified
  const originalModifyQuantity = cartProto.modifyQuantity;
  cartProto.modifyQuantity = function(productId: string | number, quantity: number, catalogue?: any): boolean {
    const result = originalModifyQuantity.call(this, productId, quantity, catalogue);
    if (result) {
      saveToLocalStorage('cart', sharedCart);
    }
    return result;
  };

  // Save cart when cleared
  const originalClear = cartProto.clear;
  cartProto.clear = function(): void {
    originalClear.call(this);
    saveToLocalStorage('cart', sharedCart);
  };

  // Save customer details whenever they change
  const customerProto = Object.getPrototypeOf(sharedCustomer);
  const originalUpdateDetails = customerProto.updateDetails;
  
  if (originalUpdateDetails) {
    customerProto.updateDetails = function(...args: any[]): any {
      const result = originalUpdateDetails.apply(this, args);
      saveToLocalStorage('customer', sharedCustomer);
      return result;
    };
  }

  // Also save when address is added
  const originalAddAddress = customerProto.addAddress;
  if (originalAddAddress) {
    customerProto.addAddress = async function(address: string): Promise<boolean> {
      const result = await originalAddAddress.call(this, address);
      saveToLocalStorage('customer', sharedCustomer);
      return result;
    };
  }

  // Save when order is placed
  const originalPlaceOrder = customerProto.placeOrder;
  if (originalPlaceOrder) {
    customerProto.placeOrder = async function(orderDetails: any): Promise<boolean> {
      const result = await originalPlaceOrder.call(this, orderDetails);
      saveToLocalStorage('customer', sharedCustomer);
      return result;
    };
  }
  
  // Set up a timer to periodically save catalogue state
  // This is a fallback in case any modifications are missed
  setInterval(() => {
    try {
      const products = sharedCatalogue.getProducts();
      localStorage.setItem('catalogue_products', JSON.stringify(products));
    } catch (error) {
      console.error('Error in catalogue auto-save:', error);
    }
  }, 30000); // Save every 30 seconds as a fallback
};

setupAutoSave();
