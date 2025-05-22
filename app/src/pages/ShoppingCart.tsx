import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { sharedCart, sharedCatalogue } from '../models';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { sharedCart, sharedCatalogue } from '../models';

/**
 * ShoppingCart component displays all items in the user's cart
 * and allows them to modify quantities, remove items, or proceed to checkout
 */
const ShoppingCart: React.FC = () => {
  // State to force re-render when cart changes
  const [cartItemCount, setCartItemCount] = useState(sharedCart.getItemCount());
  
  // Subscribe to cart changes to keep UI in sync
  useEffect(() => {
    const unsubscribe = sharedCart.subscribe(() => {
      setCartItemCount(sharedCart.getItemCount());
    });
    
    // Clean up subscription on component unmount
    return unsubscribe;
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/"
          sx={{ display: 'flex', alignItems: 'center' }}
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
      
      {/* Cart content - rendered by the Cart class */}
      <Box>
        {sharedCart.renderCart(sharedCatalogue)}
      </Box>
    </Container>
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shopping Cart</h1>
      {sharedCart.renderCart(sharedCatalogue)}
    </div>
  );
};

export default ShoppingCart;
