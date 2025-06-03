import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { CartItemWithProduct } from '../models/CheckoutManagerTest';
import { sharedCart, sharedOrder } from '../models';
import { checkoutManager } from '../models/CheckoutManagerTest';
import ShippingView from './ShippingView';

type ShippingViewRef = {
  getFormData: () => {
    streetAddress: string;
    suburb: string;
    state: string;
    postcode: string;
  } | null;
};
import PaymentView from './PaymentView';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

interface CheckOutViewState {
  isCheckoutValid: boolean;
  cartItems: CartItemWithProduct[];
  selectedShippingOption: {
    id: string;
    companyId: string;
    name: string;
    companyName: string;
    description: string;
    price: number;
    estimatedDays: string;
    hasSurcharge?: boolean;
    surchargeAmount?: number;
    isFree?: boolean;
  } | null;
  shippingCost: number;
  isPaymentVerified: boolean;
  paymentError: string | null;
  isProcessing: boolean;
  paymentFormData: PaymentFormData | null;
}

type CheckOutViewProps = {
  onPaymentProcessed?: (success: boolean) => void;
};

export class CheckOutView extends React.Component<CheckOutViewProps, CheckOutViewState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isCheckoutValid: false,
      cartItems: [],
      selectedShippingOption: null,
      shippingCost: 0,
      isPaymentVerified: false,
      paymentError: null,
      isProcessing: false,
      paymentFormData: null
    };
  }

  private cartSubscription: (() => void) | null = null;

  componentDidMount() {
    // Set up the validity change callback
    checkoutManager.setValidityChangeCallback(this.handleValidityChange);
    
    // Initial cart update
    this.updateCart();
    
    // Subscribe to cart changes
    this.cartSubscription = sharedCart.subscribe(() => {
      this.updateCart();
    });
  }

  componentWillUnmount() {
    // Clean up subscription
    if (this.cartSubscription) {
      this.cartSubscription();
    }
  }

  private updateCart = () => {
    // Only update state if cart items have actually changed
    const newItems = checkoutManager.getCartItems();
    const currentItems = this.state.cartItems;
    
    // Simple check to prevent unnecessary re-renders
    const itemsChanged = 
      newItems.length !== currentItems.length ||
      newItems.some((item: CartItemWithProduct, index: number) => 
        currentItems[index]?.product.id !== item.product.id ||
        currentItems[index]?.quantity !== item.quantity
      );

    if (itemsChanged) {
      this.setState({ cartItems: newItems });
    }
  };

  private updateCheckoutValidity = () => {
    // Check both payment verification and shipping validity
    const { isPaymentVerified, selectedShippingOption } = this.state;
    const isShippingValid = selectedShippingOption !== null;
    const isCheckoutValidNow = isPaymentVerified && isShippingValid;
    
    // Only update state if validity actually changed
    if (this.state.isCheckoutValid !== isCheckoutValidNow) {
      this.setState({ isCheckoutValid: isCheckoutValidNow });
    }
    
    // Always notify the parent about the current validity
    if (this.props.onPaymentProcessed) {
      this.props.onPaymentProcessed(isPaymentVerified);
    }
  };

  // This is kept for backward compatibility with the payment form
  private handleValidityChange = (_isValid?: boolean) => {
    this.updateCheckoutValidity();
  };

  private handlePaymentProcessed = (success: boolean, data?: any) => {
    console.log('CheckOutView: Payment processed:', { success, data: data ? {
      ...data,
      cardNumber: data.cardNumber ? `${data.cardNumber.substring(0, 4)}...${data.cardNumber.slice(-4)}` : 'N/A',
      cvv: data.cvv ? '***' : 'N/A'
    } : 'No data' });
    
    if (success) {
      if (!data) {
        const errorMsg = 'No payment data received';
        console.error(errorMsg);
        this.setState({
          isPaymentVerified: false,
          paymentError: errorMsg,
          paymentFormData: null
        }, this.updateCheckoutValidity);
        return;
      }
      
      // Ensure we have all required fields
      if (!data.cardNumber || !data.expiryDate || !data.cvv) {
        const errorMsg = 'Payment information is incomplete';
        console.error(errorMsg, {
          hasCardNumber: !!data.cardNumber,
          hasExpiryDate: !!data.expiryDate,
          hasCvv: !!data.cvv
        });
        this.setState({
          isPaymentVerified: false,
          paymentError: errorMsg,
          paymentFormData: null
        }, this.updateCheckoutValidity);
        return;
      }
      
      const paymentData = {
        cardNumber: data.cardNumber.replace(/\s/g, ''), // Remove any spaces from card number
        expiryDate: data.expiryDate,
        cvv: data.cvv,
        cardHolderName: data.cardHolderName || 'Card Holder'
      };
      
      console.log('Setting payment form data:', {
        ...paymentData,
        cardNumber: `${paymentData.cardNumber.substring(0, 4)}...${paymentData.cardNumber.slice(-4)}`,
        cvv: '***'
      });
      
      this.setState({ 
        isPaymentVerified: true,
        paymentError: null,
        paymentFormData: paymentData
      }, this.updateCheckoutValidity);
    } else {
      const errorMessage = data?.error || 'Payment verification failed';
      console.error('Payment verification failed:', errorMessage);
      this.setState({ 
        isPaymentVerified: false,
        paymentError: errorMessage,
        paymentFormData: null
      }, this.updateCheckoutValidity);
    }
  };

  private handleEdit = (): void => {
    this.setState({
      isPaymentVerified: false,
      paymentError: null,
      isProcessing: false,
      isCheckoutValid: false
    }, () => {
      // Update the checkout validity which will also notify parent
      this.updateCheckoutValidity();
    });
  };

  private shippingViewRef = React.createRef<ShippingViewRef>();

  private handlePlaceOrder = () => {
    // Get the shipping form data from the ShippingView
    if (!this.shippingViewRef.current) {
      console.error('Shipping view reference not found');
      return;
    }
    
    // Log that we're starting the order placement process
    console.group('Placing Order');

    const formData = this.shippingViewRef.current.getFormData();
    if (!formData) {
      console.error('Shipping form data is null');
      return;
    }

    // Get cart items from checkoutManager
    const cartItems = checkoutManager.getCartItems();
    
    // Transfer cart items to sharedOrder
    sharedOrder.addItems(cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity
    })));
    
    // Set shipping information in sharedOrder
    sharedOrder.setShippingInfo({
      streetAddress: formData.streetAddress,
      town: formData.suburb, // Using suburb as town
      state: formData.state,
      postcode: formData.postcode,
      country: 'Australia' // Default to Australia
    });
    
    // Use the actual payment information from the form
    if (!this.state.paymentFormData) {
      const errorMsg = 'No payment information available. Please complete the payment form.';
      console.error(errorMsg);
      this.setState({
        paymentError: errorMsg,
        isPaymentVerified: false
      }, () => {
        // Scroll to the payment section
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
      return;
    }
    
    // Ensure required payment fields are present
    const { cardNumber, expiryDate, cvv, cardHolderName } = this.state.paymentFormData;
    if (!cardNumber || !expiryDate || !cvv) {
      const errorMsg = 'Payment information is incomplete. Please verify your card details.';
      console.error(errorMsg, { 
        hasCardNumber: !!cardNumber,
        hasExpiryDate: !!expiryDate,
        hasCvv: !!cvv
      });
      this.setState({
        paymentError: errorMsg,
        isPaymentVerified: false
      });
      return;
    }
    
    const paymentInfo = {
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces from card number
      expiryDate,
      cvv,
      cardHolderName: cardHolderName || 'Card Holder'
    };
    
    console.log('Using payment info:', {
      ...paymentInfo,
      cardNumber: `${paymentInfo.cardNumber.substring(0, 4)}...${paymentInfo.cardNumber.slice(-4)}`,
      cvv: '***'
    });
    
    sharedOrder.setPaymentInfo(paymentInfo);
    
    // Update the order's total to include shipping cost
    const subtotal = checkoutManager.calculateSubtotal();
    const total = subtotal + this.state.shippingCost;
    
    // Set the shipping cost in the order
    sharedOrder.setShippingCost(this.state.shippingCost);
    
    // Set the shipping option details if available
    if (this.state.selectedShippingOption) {
      sharedOrder.setShippingOption({
        name: this.state.selectedShippingOption.name,
        companyName: this.state.selectedShippingOption.companyName,
        estimatedDays: this.state.selectedShippingOption.estimatedDays
      });
    }
    
    // Submit the order
    const success = sharedOrder.submitOrder();
    
    if (!success) {
      console.error('Failed to submit order');
      alert('There was an error processing your order. Please try again.');
      return;
    }
    
    // Calculate order summary for logging
    const orderSummary = {
      subtotal: subtotal,
      shipping: this.state.shippingCost,
      total: total
    };

    console.group('Order Summary');
    console.log('Subtotal:', `$${orderSummary.subtotal.toFixed(2)}`);
    console.log('Shipping:', `$${orderSummary.shipping.toFixed(2)}`);
    console.log('Total:', `$${orderSummary.total.toFixed(2)}`);
    console.groupEnd();
    console.groupEnd(); // End the 'Placing Order' group
    
    // The navigation to the order page is handled by the Link component's 'to' prop
    // Log the final order summary for verification
    const orderSummaryObj = sharedOrder.getOrderSummary();
    console.log('Final Order Summary:', orderSummaryObj);
    console.log('Order Total (should include shipping):', orderSummaryObj.total.toFixed(2));
  };

  private handleShippingOptionSelect = (option: any) => {
    if (option) {
      this.setState({
        selectedShippingOption: {
          id: option.id || 'standard',
          companyId: option.companyId || option.id || 'standard',
          name: option.name,
          companyName: option.companyName || option.name,
          description: option.description || `Estimated delivery: ${option.estimatedDays}`,
          price: option.price,
          estimatedDays: option.estimatedDays,
          hasSurcharge: option.hasSurcharge,
          surchargeAmount: option.surchargeAmount,
          isFree: option.isFree
        },
        shippingCost: option.price
      }, () => {
        // Update the checkout validity when shipping option changes
        this.updateCheckoutValidity();
      });
    } else {
      this.setState({
        selectedShippingOption: null,
        shippingCost: 0,
        isCheckoutValid: false // Explicitly set to false when no shipping option is selected
      });
    }
  };

  private calculateSubtotal = (): number => {
    // Cache the result if cart items haven't changed
    const { cartItems } = this.state;
    return cartItems.reduce((total, { product, quantity }) => {
      return total + (product.price * quantity);
    }, 0);
  }

  private calculateTotal = (): number => {
    return this.calculateSubtotal() + this.state.shippingCost;
  };

  render() {
    const { cartItems, isCheckoutValid } = this.state;
    const subtotal = this.calculateSubtotal();

    if (cartItems.length === 0) {
      return (
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/"
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Container>
      );
    }

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Checkout
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Column - Forms */}
          <Box sx={{ flex: 2 }}>
            <ShippingView 
              ref={this.shippingViewRef as any}
              onNext={() => {}}
              onShippingOptionSelect={this.handleShippingOptionSelect}
            />
            <PaymentView 
              amount={this.calculateTotal()}
              onPaymentProcessed={this.handlePaymentProcessed}
              onEdit={this.handleEdit}
              readOnly={this.state.isPaymentVerified}
            />
          </Box>

          {/* Right Column - Order Summary */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 16 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              {cartItems.map(({ product, quantity }) => {
                const itemTotal = product.price * quantity;
                return (
                  <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quantity} × ${product.price.toFixed(2)} each
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      ${itemTotal.toFixed(2)}
                    </Typography>
                  </Box>
                );
              })}

              <Box sx={{ borderTop: '1px solid #eee', mt: 2, pt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
                  <Typography sx={{ minWidth: '80px', mr: 1 }}>Shipping</Typography>
                  <Typography sx={{ textAlign: { xs: 'right', sm: 'right' }, flex: 1 }}>
                    {this.state.selectedShippingOption 
                      ? `${this.state.selectedShippingOption.name} (${this.state.selectedShippingOption.estimatedDays}) - $${this.state.shippingCost.toFixed(2)}`
                      : 'Complete the shipping form to calculate shipping cost'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', pt: 2, mb: 3 }}>
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1">
                    ${(subtotal + (this.state.shippingCost || 0)).toFixed(2)}
                    {this.state.shippingCost > 0 && ` ($${subtotal.toFixed(2)} + $${this.state.shippingCost.toFixed(2)} shipping)`}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link} 
                  to={`/order/${sharedOrder.getOrderSummary().orderId}`}
                  disabled={!isCheckoutValid}
                  onClick={this.handlePlaceOrder}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  Place Order
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    );
  }
}

export default CheckOutView;