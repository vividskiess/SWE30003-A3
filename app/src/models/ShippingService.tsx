type Address = {
  streetAddress: string;
  town: string;
  state: string;
  postcode: string;
  country: string;
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
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
  // Available shipping methods with their base rates
  private readonly availableMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '3-5 business days',
      price: 5.99,
      estimatedDays: '3-5 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: 12.99,
      estimatedDays: '1-2 business days'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      price: 24.99,
      estimatedDays: '1 business day'
    }
  ];

  // Mock remote areas that might have additional charges
  private readonly remoteAreas = [
    { postcode: '0872', state: 'NT' }, // Remote NT
    { postcode: '4825', state: 'QLD' }, // Outback QLD
    { postcode: '0872', state: 'WA' }   // Remote WA
  ];

  // Simulate API call to validate address
  public async validateAddress(address: Address): Promise<ShippingResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const issues: string[] = [];

    // Basic validation
    if (!address.streetAddress || address.streetAddress.trim().length < 5) {
      issues.push('Please enter a valid street address');
    }

    if (!address.town || address.town.trim().length < 2) {
      issues.push('Please enter a valid town/suburb');
    }

    if (!address.postcode || !/^\d{4}$/.test(address.postcode)) {
      issues.push('Please enter a valid 4-digit postcode');
    }

    if (!address.country) {
      issues.push('Please select a country');
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

    // Check for remote area surcharge
    const isRemote = this.remoteAreas.some(
      area => 
        area.postcode === address.postcode && 
        area.state.toLowerCase() === address.state.toLowerCase()
    );

    // Calculate additional charges
    let additionalCharges = 0;
    
    // Remote area surcharge
    if (isRemote) {
      additionalCharges += 15.00;
    }

    // Oversize/overweight surcharge
    const { weight, dimensions } = packageDetails;
    const isOversized = 
      dimensions.length > 100 || 
      dimensions.width > 100 || 
      dimensions.height > 100 ||
      (dimensions.length + dimensions.width + dimensions.height) > 200;
      
    const isOverweight = weight > 20; // kg
    
    if (isOversized) additionalCharges += 10.00;
    if (isOverweight) additionalCharges += 15.00;
    if (packageDetails.isFragile) additionalCharges += 5.00;

    // Apply free shipping for orders over $100
    const freeShippingThreshold = 100;
    const isFreeShippingEligible = cartTotal >= freeShippingThreshold;

    // Calculate final shipping methods with rates
    const methods = this.availableMethods.map(method => {
      let finalPrice = method.price + additionalCharges;
      
      // Apply free shipping if eligible (only for standard shipping)
      if (isFreeShippingEligible && method.id === 'standard') {
        finalPrice = 0;
      }
      
      return {
        ...method,
        price: parseFloat(finalPrice.toFixed(2)),
        originalPrice: method.price,
        hasSurcharge: additionalCharges > 0,
        surchargeAmount: additionalCharges > 0 ? additionalCharges : undefined,
        isFree: finalPrice === 0 ? true : undefined
      };
    });

    return {
      success: true,
      methods
    };
  }

  // Get shipping method by ID
  public getShippingMethod(id: string): ShippingMethod | undefined {
    return this.availableMethods.find(method => method.id === id);
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