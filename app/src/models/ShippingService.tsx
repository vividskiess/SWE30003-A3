type Address = {
  streetAddress: string;
  town: string;
  state: string;
  postcode: string;
};

export type DeliveryCompany = {
  id: string;
  name: string;
  serviceAreas: string[]; // List of postcode prefixes or suburb names
  supportedStates: string[]; // List of supported states
  baseRate: number;
  weightLimit: number; // in kg
  maxDimensions: {
    length: number;
    width: number;
    height: number;
  };
  estimatedDelivery: string;
};

type ShippingMethod = {
  id: string;
  companyId: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  companyName: string;
};

type ShippingResponse = {
  success: boolean;
  methods?: ShippingMethod[];
  error?: string;
  validation?: {
    isValid: boolean;
    issues?: string[];
  };
};

type PackageDetails = {
  weight: number; // in kg
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };
  isFragile: boolean;
};

export class ShippingService {
  // Available delivery companies with their service areas
  private readonly deliveryCompanies: DeliveryCompany[] = [
    {
      id: 'auspost',
      name: 'Australia Post',
      serviceAreas: ['30', '31', '32', '33', '80', '90'], // Sample postcode prefixes
      supportedStates: ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
      baseRate: 8.99,
      weightLimit: 22,
      maxDimensions: { length: 105, width: 105, height: 105 },
      estimatedDelivery: '2-5 business days'
    },
    {
      id: 'tnt',
      name: 'TNT Express',
      serviceAreas: ['30', '31', '32', '33', '20', '21', '22', '40', '41', '42', '50', '51', '52', '60', '61', '62', '70', '71', '72', '08', '09'],
      supportedStates: ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
      baseRate: 12.99,
      weightLimit: 70,
      maxDimensions: { length: 120, width: 80, height: 80 },
      estimatedDelivery: '1-3 business days'
    },
    {
      id: 'startrack',
      name: 'StarTrack',
      serviceAreas: ['30', '31', '32', '33', '20', '21', '40', '41', '50', '51', '60', '61', '70', '71', '08', '09'],
      supportedStates: ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'],
      baseRate: 15.99,
      weightLimit: 100,
      maxDimensions: { length: 150, width: 120, height: 120 },
      estimatedDelivery: '1-2 business days'
    }
  ];

  // Generate available methods based on delivery companies
  private getAvailableMethods(): ShippingMethod[] {
    return this.deliveryCompanies.map(company => ({
      id: `${company.id}-standard`,
      companyId: company.id,
      companyName: company.name,
      name: `${company.name} Standard`,
      description: company.estimatedDelivery,
      price: company.baseRate,
      estimatedDays: company.estimatedDelivery
    }));
  }

  // Valid suburbs with their details
  private readonly validSuburbs = [
    // Melbourne suburbs (more expensive)
    { name: 'Box Hill', postcode: '3128', state: 'VIC', isServiceable: true, priceMultiplier: 1.2 },
    { name: 'Blackburn', postcode: '3130', state: 'VIC', isServiceable: true, priceMultiplier: 1.2 },
    { name: 'Glen Waverley', postcode: '3150', state: 'VIC', isServiceable: true, priceMultiplier: 1.2 },
    { name: 'South Yarra', postcode: '3141', state: 'VIC', isServiceable: true, priceMultiplier: 1.3 },
    
    // Sydney suburbs (less expensive)
    { name: 'Burwood', postcode: '2134', state: 'NSW', isServiceable: true, priceMultiplier: 1.0 },
    { name: 'Newtown', postcode: '2042', state: 'NSW', isServiceable: true, priceMultiplier: 1.0 },
    { name: 'Randwick', postcode: '2031', state: 'NSW', isServiceable: true, priceMultiplier: 1.0 },
    { name: 'Chatswood', postcode: '2067', state: 'NSW', isServiceable: false, priceMultiplier: 1.0 },
    
    // Fake addresses for testing
    { name: '123 Fake St', postcode: '3000', state: 'VIC', isServiceable: true, priceMultiplier: 1.2 },
    { name: '456 Imaginary Rd', postcode: '2000', state: 'NSW', isServiceable: true, priceMultiplier: 1.0 }
  ];

  // Mock remote areas that might have additional charges
  private readonly remoteAreas = [
    { postcode: '0872', state: 'NT' }, // Remote NT
    { postcode: '4825', state: 'QLD' }, // Outback QLD
    { postcode: '0872', state: 'WA' }   // Remote WA
  ];

  // Get suburb details if it exists
  private getSuburbDetails(town: string, postcode: string, state: string) {
    return this.validSuburbs.find(
      suburb => suburb.name.toLowerCase() === town.toLowerCase() &&
               suburb.postcode === postcode &&
               suburb.state === state.toUpperCase()
    );
  }

  // Validate street address format
  private isValidStreetAddress(address: string): boolean {
    // Basic pattern: 1-5 digits followed by letters, spaces, and common address characters
    const addressRegex = /^\d{1,5}\s+[a-zA-Z0-9\s\-\#\.\,]+$/;
    return addressRegex.test(address);
  }

  // Simulate API call to validate address
  public async validateAddress(address: Address): Promise<ShippingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const issues: string[] = [];

    // Street address validation
    if (!address.streetAddress || address.streetAddress.trim().length < 5) {
      issues.push('Please enter a valid street address');
    } else if (!this.isValidStreetAddress(address.streetAddress)) {
      issues.push('Please enter a valid street address (e.g., 123 Main St)');
    }

    if (!address.town || address.town.trim().length < 2) {
      issues.push('Please enter a valid town/suburb');
    } else {
      // Check if suburb exists in our list
      const suburb = this.getSuburbDetails(address.town, address.postcode, address.state);
      if (!suburb) {
        issues.push('We do not deliver to this suburb. Please check your address.');
      } else if (!suburb.isServiceable) {
        issues.push('This suburb is currently not serviceable. Please try another address.');
      }
    }

    if (!address.postcode || !/^\d{4}$/.test(address.postcode)) {
      issues.push('Please enter a valid 4-digit postcode');
    }

    if (issues.length > 0) {
      return {
        success: false,
        error: 'Address validation failed',
        validation: {
          isValid: false,
          issues
        }
      };
    }

    return {
      success: true,
      validation: {
        isValid: true
      }
    };
  }

  // Check if a company can deliver to the given address
  private canDeliverToAddress(company: DeliveryCompany, address: Address): boolean {
    // Check if company supports the state
    const stateSupported = company.supportedStates
      .map(s => s.toLowerCase())
      .includes(address.state.toLowerCase());
    
    if (!stateSupported) return false;

    // Check if postcode is in service area
    const isInServiceArea = company.serviceAreas.some(area => 
      address.postcode.startsWith(area)
    );
    
    return isInServiceArea;
  }

  // Calculate shipping rates based on address and package details
  public async calculateShipping(
    address: Address,
    packageDetails: PackageDetails,
    cartTotal: number
  ): Promise<ShippingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate address first
    const validation = await this.validateAddress(address);
    if (!validation.success) {
      return validation;
    }

    // Get suburb details for pricing
    const suburb = this.getSuburbDetails(address.town, address.postcode, address.state);
    if (!suburb) {
      return {
        success: false,
        error: 'Invalid suburb details. Please check your address.'
      };
    }

    // Check if suburb is serviceable
    if (!suburb.isServiceable) {
      return {
        success: false,
        error: 'This suburb is currently not serviceable. Please try another address.'
      };
    }

    // Find available companies for this address
    const availableCompanies = this.deliveryCompanies.filter(company => 
      this.canDeliverToAddress(company, address)
    );

    // If no companies can deliver to this address
    if (availableCompanies.length === 0) {
      return {
        success: false,
        error: 'Sorry, we are unable to deliver to this address with any of our delivery partners.'
      };
    }

    // Check for remote area
    const isRemote = this.remoteAreas.some(
      area => area.postcode === address.postcode && area.state === address.state
    );

    // Generate shipping methods from available companies
    const methods = availableCompanies.map(company => {
      // Calculate base price with location-based pricing
      let price = company.baseRate * suburb.priceMultiplier;
      
      // Add weight surcharge if over 5kg
      if (packageDetails.weight > 5) {
        price += (packageDetails.weight - 5) * 0.5;
      }
      
      // Add fragile surcharge
      if (packageDetails.isFragile) {
        price += 5.00;
      }
      
      // Add remote area surcharge if applicable
      if (isRemote) {
        price += 15.00;
      }
      
      // Round to 2 decimal places
      price = Math.round(price * 100) / 100;
      
      // Free shipping for orders over $100
      const isFreeShipping = cartTotal >= 100;
      
      return {
        id: `${company.id}-${Date.now()}`,
        companyId: company.id,
        name: company.name,
        description: `Estimated delivery: ${company.estimatedDelivery}`,
        price: isFreeShipping ? 0 : price,
        estimatedDays: company.estimatedDelivery,
        companyName: company.name,
        isFree: isFreeShipping,
        hasSurcharge: isRemote,
        surchargeAmount: isRemote ? 15.00 : 0
      };
    });

    return {
      success: true,
      methods
    };
  }

  // Get shipping method by ID
  public getShippingMethod(id: string): ShippingMethod | undefined {
    return this.getAvailableMethods().find(method => method.id === id);
  }

  // ... (rest of the code remains the same)
  public getDeliveryCompanies(): DeliveryCompany[] {
    return [...this.deliveryCompanies];
  }

  // Get estimated delivery date
  public getEstimatedDeliveryDate(methodId: string): Date {
    const method = this.getShippingMethod(methodId);
    if (!method) {
      throw new Error('Invalid shipping method');
    }

    const date = new Date();
    let daysToAdd = 0;

    switch (method.id) {
      case 'standard':
        daysToAdd = 3 + Math.floor(Math.random() * 3); // 3-5 days
        break;
      case 'express':
        daysToAdd = 1 + Math.floor(Math.random() * 2); // 1-2 days
        break;
      case 'overnight':
        daysToAdd = 1; // Next business day
        break;
      default:
        daysToAdd = 3;
    }

    // Skip weekends
    while (daysToAdd > 0) {
      date.setDate(date.getDate() + 1);
      // If it's not a weekend (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        daysToAdd--;
      }
    }

    return date;
  }
}

// Create a shared instance
export const shippingService = new ShippingService();

// Example usage:
/*
async function exampleUsage() {
  const address = {
    streetAddress: '123 Test St',
    town: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    country: 'Australia'
  };

  const packageDetails = {
    weight: 2.5, // kg
    dimensions: { length: 30, width: 20, height: 15 }, // cm
    isFragile: false
  };

  try {
    // Validate address
    const validation = await shippingService.validateAddress(address);
    if (!validation.validation?.isValid) {
      console.error('Address validation failed:', validation.validation?.issues);
      return;
    }

    // Calculate shipping
    const result = await shippingService.calculateShipping(
      address,
      packageDetails,
      150.00 // Cart total
    );

    if (result.success && result.methods) {
      console.log('Available shipping methods:', result.methods);
      
      // Get estimated delivery date for a method
      const deliveryDate = shippingService.getEstimatedDeliveryDate('standard');
      console.log('Estimated delivery date:', deliveryDate.toDateString());
    } else {
      console.error('Failed to calculate shipping:', result.error);
    }
  } catch (error) {
    console.error('Shipping service error:', error);
  }
}
*/