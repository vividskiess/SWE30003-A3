import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Breadcrumbs, Button, Paper, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { sharedCart, sharedCatalogue, sharedCustomer } from '../models';

interface ShoppingCartState {
  cartItemCount: number;
  productsInCart: Array<{
    id: string;
    quantity: number;
    name: string;
    price: number;
    total: number;
  }>;
}

/**
 * ShoppingCart component displays all items in the user's cart
 * and allows them to modify quantities, remove items, or proceed to checkout
 */
class ShoppingCart extends React.Component<{}, ShoppingCartState> {
  private unsubscribe: (() => void) | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      cartItemCount: sharedCart.getItemCount(),
      productsInCart: sharedCart.getProductsInCart(sharedCatalogue)
    };
  }

  componentDidMount() {
    // Subscribe to cart changes
    this.unsubscribe = sharedCart.subscribe(() => {
      this.setState({
        cartItemCount: sharedCart.getItemCount(),
        productsInCart: sharedCart.getProductsInCart(sharedCatalogue)
      });
    });
  }

  componentWillUnmount() {
    // Clean up subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private handleQuantityChange = (productId: string, newQuantity: number) => {
    sharedCart.modifyQuantity(productId, newQuantity);
  };

  private handleRemoveItem = (productId: string) => {
    sharedCart.removeProduct(productId);
  };

  private handleClearCart = () => {
    sharedCart.clear();
  };

  private handleProceedToCheckout = (e: React.MouseEvent) => {
    if (!sharedCustomer.getEmail()) {
      sessionStorage.setItem('pendingCheckout', 'true');
      e.preventDefault();
      window.location.href = '/login';
    }
  };

  render() {
    const { cartItemCount, productsInCart } = this.state;
    const totalPrice = sharedCart.getTotalPrice(sharedCatalogue);

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumb navigation */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            to="/"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Shopping Cart
          </Typography>
        </Breadcrumbs>
        
        {/* Page title */}
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            borderBottom: '2px solid #eee',
            pb: 2,
            mb: 4
          }}
      >
        Your Shopping Cart {cartItemCount > 0 && `(${cartItemCount} items)`}
      </Typography>
      
      {/* Cart contents */}
      {productsInCart.length === 0 ? (
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
      ) : (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
          {productsInCart.map((product) => (
            <Paper 
              key={product.id}
              elevation={2} 
              sx={{ 
                mb: 2, 
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="h6" component="h3">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price.toFixed(2)} x {product.quantity} = ${product.total.toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Quantity controls */}
                <IconButton 
                  size="small"
                  onClick={() => this.handleQuantityChange(product.id, product.quantity - 1)}
                  disabled={product.quantity <= 1}
                  color="primary"
                >
                  <RemoveIcon />
                </IconButton>
                
                <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                  {product.quantity}
                </Typography>
                
                <IconButton 
                  size="small"
                  onClick={() => this.handleQuantityChange(product.id, product.quantity + 1)}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
                
                {/* Remove button */}
                <IconButton 
                  size="small"
                  onClick={() => this.handleRemoveItem(product.id)}
                  color="error"
                  sx={{ ml: 1 }}
                  aria-label="remove item"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
          
          {/* Cart summary */}
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Subtotal ({cartItemCount} items):</Typography>
              <Typography variant="body1" fontWeight="bold">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={this.handleClearCart}
              >
                Clear Cart
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                component={Link} 
                to="/checkout"
                onClick={this.handleProceedToCheckout}
                sx={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                {sharedCustomer.getEmail() ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
    );
  }
}


export default ShoppingCart;
