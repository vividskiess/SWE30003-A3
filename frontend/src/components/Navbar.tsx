import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconButtonWithBadge } from './IconButtonWithBadge';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" component="div" sx={{ mr: 2, flexGrow: 1 }}>
            AWE Electronics
          </Typography>
        </Link>
        
        {/* If want home page */}
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/checkout">Checkout</Button>
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button color="inherit" component={Link} to="/cart">Cart</Button>
          <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Link to="/cart">
            <IconButtonWithBadge
              sx={{ color: 'white' }}
              aria-label="shopping cart"
              icon={<ShoppingCartIcon />}
              badgeContent={0}
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