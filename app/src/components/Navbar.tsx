import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButtonWithBadge } from './IconButtonWithBadge';
import { sharedCart, sharedCustomer, sharedStaff } from '../models';
import { User } from '../models/User';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar: React.FC = () => {
  // State to track cart item count and auth state
  const [cartItemCount, setCartItemCount] = useState(sharedCart.getItemCount());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // Subscribe to cart changes to update badge
  useEffect(() => {
    const cartUnsubscribe = sharedCart.subscribe(() => {
      const newCount = sharedCart.getItemCount();
      setCartItemCount(newCount);
    });

    // Check auth state
    const checkAuth = () => {
      try {
        // Check both User.currentUser and shared instances
        const user = User['currentUser'] as any;
        const customerEmail = sharedCustomer.getEmail();
        const staffEmail = sharedStaff.getEmail();
        const email = user?.email || customerEmail || staffEmail;
        
        const loggedIn = !!email;
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
          setUserEmail(email);
        } else {
          setUserEmail('');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setIsLoggedIn(false);
        setUserEmail('');
      } finally {
        setIsLoading(false);
      }
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
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {userEmail}
              </Typography>
              <Link to="/profile">
                <IconButtonWithBadge
                  sx={{ color: 'white' }}
                  aria-label="user profile"
                  icon={<AccountCircleIcon sx={{ fontSize: 32 }} />}
                />
              </Link>
            </Box>
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