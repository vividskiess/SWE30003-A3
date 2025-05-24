export type PaymentDetails = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  amount: number;
};

export type PaymentResponse = {
  success: boolean;
  transactionId?: string;
  error?: string;
  timestamp: string;
};

export class PaymentService {
  // Mock database of valid card numbers and their details
  private readonly validCards = [
    {
      cardNumber: '4242424242424242',
      expiryDate: '12/25',
      cvv: '123',
      cardHolderName: 'VALID CARD',
      balance: 1000.00
    },
    {
      cardNumber: '5555555555554444',
      expiryDate: '06/26',
      cvv: '456',
      cardHolderName: 'MASTERCARD TEST',
      balance: 500.00
    }
  ];

  // Mock API call to process payment
  public async processPayment(paymentDetails: PaymentDetails): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate card number format (basic Luhn check)
    if (!this.isValidCardNumber(paymentDetails.cardNumber)) {
      return this.createErrorResponse('Invalid card number');
    }

    // Validate expiry date
    if (!this.isValidExpiryDate(paymentDetails.expiryDate)) {
      return this.createErrorResponse('Invalid or expired card');
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
      return this.createErrorResponse('Invalid CVV');
    }

    // Find card in our mock database
    const card = this.validCards.find(card => 
      card.cardNumber === paymentDetails.cardNumber.replace(/\s+/g, '') &&
      card.expiryDate === paymentDetails.expiryDate &&
      card.cvv === paymentDetails.cvv
    );

    if (!card) {
      return this.createErrorResponse('Card not found or details do not match');
    }

    // Check if card has sufficient balance
    if (card.balance < paymentDetails.amount) {
      return this.createErrorResponse('Insufficient funds');
    }

    // Simulate processing fee
    const processingFee = paymentDetails.amount * 0.03; // 3% fee
    const totalCharge = paymentDetails.amount + processingFee;

    // Deduct amount from balance (in a real app, this would be a transaction)
    card.balance -= totalCharge;

    // Return success response
    return {
      success: true,
      transactionId: `TXN${Date.now().toString().padStart(10, '0')}`,
      timestamp: new Date().toISOString()
    };
  }

  // Validate card number using Luhn algorithm
  private isValidCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }

  // Validate expiry date (MM/YY format)
  private isValidExpiryDate(expiryDate: string): boolean {
    const [month, year] = expiryDate.split('/').map(Number);
    if (!month || !year || month < 1 || month > 12) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    // Check if card is expired
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    
    return true;
  }

  private createErrorResponse(error: string): PaymentResponse {
    return {
      success: false,
      error,
      timestamp: new Date().toISOString()
    };
  }
}

// Create a shared instance
export const paymentService = new PaymentService();

// Example usage:
/*
async function exampleUsage() {
  const paymentDetails = {
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '12/25',
    cvv: '123',
    cardHolderName: 'John Doe',
    amount: 99.99
  };

  try {
    const result = await paymentService.processPayment(paymentDetails);
    if (result.success) {
      console.log('Payment successful!', result);
    } else {
      console.error('Payment failed:', result.error);
    }
  } catch (error) {
    console.error('Payment processing error:', error);
  }
}
*/