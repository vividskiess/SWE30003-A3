import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { CartItemWithProduct } from '../models/CheckoutManagerTest';
import { sharedCart } from '../models';
import { checkoutManager } from '../models/CheckoutManagerTest';
import ShippingView from './ShippingView';
import PaymentView from './PaymentView';

interface CheckOutViewState {
  isCheckoutValid: boolean;
  cartItems: CartItemWithProduct[];
  selectedShippingOption: {
    name: string;
    price: number;
    estimatedDays: string;
  } | null;
  shippingCost: number;
}

export class CheckOutView extends React.Component<{}, CheckOutViewState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isCheckoutValid: false,
      cartItems: [],
      selectedShippingOption: null,
      shippingCost: 0
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

  private handleValidityChange = (isValid: boolean) => {
    // Only update state if validity actually changed
    if (this.state.isCheckoutValid !== isValid) {
      this.setState({ isCheckoutValid: isValid });
    }
  };

  private handlePlaceOrder = () => {
    console.log('Placing order with shipping option:', this.state.selectedShippingOption);
    // TODO: Implement order placement logic
  };

  private handleShippingOptionSelect = (option: any) => {
    if (option) {
      this.setState({
        selectedShippingOption: {
          name: option.name,
          price: option.price,
          estimatedDays: option.estimatedDays
        },
        shippingCost: option.price
      });
    } else {
      this.setState({
        selectedShippingOption: null,
        shippingCost: 0
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
              onNext={() => {}}
              onShippingOptionSelect={this.handleShippingOptionSelect}
            />
            <PaymentView 
              amount={this.calculateTotal()}
              onPaymentProcessed={(success) => {
                // Update the checkout validity when payment is processed
                checkoutManager.handlePaymentFormValidityChange(success);
              }}
            />
          </Box>

          {/* Right Column - Order Summary */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 16 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              {cartItems.map(({ product, quantity }) => (
                <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {product.name} × {quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${(product.price * quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Box sx={{ borderTop: '1px solid #eee', mt: 2, pt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Shipping</Typography>
                  <Typography>
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