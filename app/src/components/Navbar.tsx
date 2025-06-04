import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButtonWithBadge } from './IconButtonWithBadge';
import { sharedCart } from '../models';
import { sharedCustomer, sharedStaff } from '../models';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar: React.FC = () => {
  // State to track cart item count and auth state
  const [cartItemCount, setCartItemCount] = useState(sharedCart.getItemCount());
  const [isLoggedIn, setIsLoggedIn] = useState(!!(sharedCustomer.getEmail() || sharedStaff.getEmail()));

  // Subscribe to cart changes to update badge
  useEffect(() => {
    const cartUnsubscribe = sharedCart.subscribe(() => {
      const newCount = sharedCart.getItemCount();
      setCartItemCount(newCount);
    });

    // Check auth state whenever the component re-renders
    const checkAuth = () => {
      setIsLoggedIn(!!(sharedCustomer.getEmail() || sharedStaff.getEmail()));
    };

    // Initial check
    checkAuth();

    // Set up a timer to check auth state periodically
    const authCheckInterval = setInterval(checkAuth, 1000);

    // Cleanup subscriptions on component unmount
    return () => {
      cartUnsubscribe();
      clearInterval(authCheckInterval);
    };
  }, []);

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ mr: 2, flexGrow: 1 }}>
            AWE Electronics
          </Typography>
        </Link>
        
        {/* Cart and Profile icons */}
        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/cart">
            <IconButtonWithBadge
              sx={{ color: 'white' }}
              badgeContent={cartItemCount}
              aria-label="shopping cart"
              icon={<ShoppingCartIcon sx={{ fontSize: 32 }} />}
              badgeColor="secondary"
            />
          </Link>
          {isLoggedIn ? (
            <Link to="/profile">
              <IconButtonWithBadge
                sx={{ color: 'white' }}
                aria-label="user profile"
                icon={<AccountCircleIcon sx={{ fontSize: 32 }} />}
              />
            </Link>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login" 
                sx={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/signup" 
                sx={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>

        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;