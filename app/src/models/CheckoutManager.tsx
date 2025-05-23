import { Box, Typography, Paper, Button } from '@mui/material';
import { sharedCart, sharedCatalogue } from './index';
import { Product } from './Product';
import { Link } from 'react-router-dom';

export class CheckoutManager {
  // Get cart items with product details
  getCartItems(): { product: Product; quantity: number }[] {
    return sharedCart.getItems()
      .map(([productId, quantity]) => ({
        product: sharedCatalogue.getProducts().find(p => String(p.id) === productId),
        quantity
      }))
      .filter((item): item is { product: Product; quantity: number } => 
        item.product !== undefined
      );
  }

  // Calculate subtotal for all items in cart
  calculateSubtotal(): number {
    return this.getCartItems().reduce((total, { product, quantity }) => {
      return total + (product.price * quantity);
    }, 0);
  }

  // Render cart items for checkout
  renderCheckoutItems() {
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
        <h1>Shipping Form</h1>

        <h1>Payment Form</h1>
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
            <Typography>Calculated at next step</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ${this.calculateSubtotal().toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }
}

export const sharedCheckoutManager = new CheckoutManager();