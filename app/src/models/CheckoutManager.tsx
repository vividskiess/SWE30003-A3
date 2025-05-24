import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { sharedCart, sharedCatalogue } from './index';
import { Product } from './Product';
import { Link } from 'react-router-dom';
import { PaymentForm } from './PaymentProcessor';
import { ShippingForm } from './ShippingManager';

interface CheckoutManagerState {
  isPaymentFormValid: boolean;
  isShippingFormValid: boolean;
}

type CartItemWithProduct = {
  product: Product;
  quantity: number;
};

export class CheckoutManager extends React.Component<{}, CheckoutManagerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isPaymentFormValid: false,
      isShippingFormValid: false
    };
  }

  private getCartItems = (): CartItemWithProduct[] => {
    return sharedCart.getItems()
      .map(([productId, quantity]) => ({
        product: sharedCatalogue.getProducts().find(p => String(p.id) === productId) as Product,
        quantity
      }))
      .filter((item): item is CartItemWithProduct => item.product !== undefined);
  }

  private calculateSubtotal = (): number => {
    return this.getCartItems().reduce((total: number, { product, quantity }) => {
      return total + (product.price * quantity);
    }, 0);
  };

  private handlePaymentFormValidityChange = (isValid: boolean): void => {
    this.setState({ isPaymentFormValid: isValid }, () => {
      console.log('Payment form valid:', isValid);
      console.log('Checkout valid:', this.isCheckoutValid());
    });
  };

  private handleShippingFormValidityChange = (isValid: boolean): void => {
    this.setState({ isShippingFormValid: isValid }, () => {
      console.log('Shipping form valid:', isValid);
      console.log('Checkout valid:', this.isCheckoutValid());
    });
  };

  private isCheckoutValid = (): boolean => {
    const { isPaymentFormValid, isShippingFormValid } = this.state;
    const isValid = isPaymentFormValid && isShippingFormValid;
    console.log('isCheckoutValid called:', { 
      payment: isPaymentFormValid, 
      shipping: isShippingFormValid, 
      isValid 
    });
    return isValid;
  };

  render() {
    const items = this.getCartItems();
    
    if (items.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
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
        </Box>
      );
    }

    return (
      <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Cart Items ({items.reduce((total, { quantity }) => total + quantity, 0)})
          </Typography>
          {items.map(({ product, quantity }) => (
            <Paper 
              key={product.id} 
              elevation={2} 
              sx={{ 
                mb: 2, 
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                '&:hover': {
                  boxShadow: 3,
                },
                transition: 'box-shadow 0.3s ease-in-out',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium' }}>
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="body1" color="text.secondary">
                    ${product.price.toFixed(2)} × {quantity}
                  </Typography>
                  <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${(product.price * quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Paper>

        {/* Shipping Information */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Shipping Information
          </Typography>
          <ShippingForm 
            onChange={(data) => {
              console.log('Shipping data updated:', data);
            }}
            onValidityChange={this.handleShippingFormValidityChange}
          />
        </Paper>

        {/* Payment Information */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Payment Information
          </Typography>
          <PaymentForm 
            onChange={(data) => {
              // Handle payment form data changes here
              console.log('Payment data updated:', data);
            }}
            onValidityChange={this.handlePaymentFormValidityChange}
          />
        </Paper>
        {/* Order Summary */}
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal</Typography>
            <Typography>${this.calculateSubtotal().toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Shipping</Typography>
            <Typography>Not yet calculated</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Grand Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ${this.calculateSubtotal().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button 
              fullWidth
              variant="contained" 
              color="primary"
              component={Link}
              to="/checkout"
              disabled={!this.isCheckoutValid()}
              sx={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                py: 1.5,
                textTransform: 'none',
                '&:disabled': {
                  backgroundColor: 'action.disabled',
                  color: 'text.disabled'
                }
              }}
            >
              Place Order
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }


}

// Create a React component that uses the CheckoutManager
const CheckoutManagerComponent: React.FC = () => {
  return <CheckoutManager />;
};

export default CheckoutManagerComponent;

// For backward compatibility, export a singleton instance
export const sharedCheckoutManager = new CheckoutManager({});