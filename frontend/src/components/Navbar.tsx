import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { IconButtonWithBadge } from './IconButtonWithBadge';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ mr: 2, flexGrow: 1 }}>
          AWE Electronics
        </Typography>
        
        {/* If want home page */}
        {/* <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button color="inherit">Home</Button>
          <Button color="inherit">Products</Button>
        </Box> */}
        
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <IconButtonWithBadge
            color="inherit"
            aria-label="shopping cart"
            icon={<ShoppingCartIcon />}
            badgeContent={0}
          />
          <IconButtonWithBadge
            color="inherit"
            aria-label="user profile"
            icon={<AccountCircleIcon sx={{ fontSize: 32 }} />}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;