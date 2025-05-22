import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButtonWithBadge } from './IconButtonWithBadge';
import { sharedCart } from '../models';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar: React.FC = () => {
  // State to track cart item count
  const [cartItemCount, setCartItemCount] = useState(sharedCart.getItemCount());

  // Subscribe to cart changes to update badge
  useEffect(() => {
    const unsubscribe = sharedCart.subscribe(() => {
      const newCount = sharedCart.getItemCount();
      setCartItemCount(newCount);
      console.log('Cart updated in navbar, new count:', newCount);
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" component="div" sx={{ mr: 2, flexGrow: 1 }}>
            AWE Electronics
          </Typography>
        </Link>
        
        {/* Navigation links */}
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/checkout">Checkout</Button>
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button color="inherit" component={Link} to="/cart">Cart</Button>
          <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
        </Box>
        
        {/* Cart and Profile icons */}
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Link to="/cart">
            <IconButtonWithBadge
              sx={{ color: 'white' }}
              aria-label="shopping cart"
              icon={<ShoppingCartIcon />}
              badgeContent={cartItemCount > 0 ? cartItemCount : undefined}
              badgeColor="secondary"
            />
          </Link>
          <Link to="/profile">
            <IconButtonWithBadge
              sx={{ color: 'white' }}
              aria-label="user profile"
              icon={<AccountCircleIcon sx={{ fontSize: 32 }} />}
            />
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;