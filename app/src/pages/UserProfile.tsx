import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Tabs, 
  Tab, 
  TextField,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const UserProfile: React.FC = () => {
  // Mock user data 
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '0412 345 678',
    address: {
      street: '123 Main St',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia'
    }
  });

  // Mock order history
  const orderHistory = [
    { id: 'ORD-001', date: '2025-05-01', status: 'Delivered', total: 125.99 },
    { id: 'ORD-002', date: '2025-04-15', status: 'Delivered', total: 79.50 },
    { id: 'ORD-003', date: '2025-03-22', status: 'Delivered', total: 214.75 }
  ];

  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(userData);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit
      setEditData(userData);
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = () => {
    setUserData(editData);
    setEditMode(false);
    setSuccessMessage('Profile updated successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3}>
        {/* Profile Header */}
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'secondary.main',
              fontSize: 40,
              mr: 2
            }}
          >
            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="body1">
              {userData.email}
            </Typography>
          </Box>
        </Box>

        {/* Profile Content */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            centered
          >
            <Tab icon={<PersonIcon />} label="Personal Info" />
            <Tab icon={<ShoppingBagIcon />} label="Order History" />
            <Tab icon={<LocationOnIcon />} label="Addresses" />
            <Tab icon={<SecurityIcon />} label="Account Security" />
          </Tabs>
        </Box>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
              color={editMode ? "error" : "primary"}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
            {editMode && (
              <Button 
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                color="success"
                sx={{ ml: 2 }}
              >
                Save Changes
              </Button>
            )}
          </Box>
          
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={editMode ? editData.firstName : userData.firstName}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={editMode ? editData.lastName : userData.lastName}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={editMode ? editData.email : userData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={editMode ? editData.phone : userData.phone}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
            </Box>
          </Stack>
        </TabPanel>

        {/* Order History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Your Previous Orders
          </Typography>
          <List>
            {orderHistory.map((order) => (
              <Paper key={order.id} elevation={1} sx={{ mb: 2 }}>
                <ListItem 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    py: 2
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order.id}
                      </Typography>
                    }
                    secondary={`Placed on: ${order.date}`}
                    sx={{ mb: { xs: 1, sm: 0 } }}
                  />
                  <Box 
                    sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      ml: { sm: 'auto' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mr: { sm: 3 } }}
                    >
                      Status: 
                      <Typography 
                        component="span" 
                        sx={{ 
                          ml: 1,
                          color: order.status === 'Delivered' ? 'success.main' : 'info.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {order.status}
                      </Typography>
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: { xs: 1, sm: 0 } }}>
                      ${order.total.toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" color="primary">
                    View Order Details
                  </Button>
                </Box>
              </Paper>
            ))}
          </List>
        </TabPanel>

        {/* Addresses Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Street Address"
                name="address.street"
                value={editMode ? editData.address.street : userData.address.street}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={editMode ? editData.address.city : userData.address.city}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="State/Province"
                  name="address.state"
                  value={editMode ? editData.address.state : userData.address.state}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  margin="normal"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="address.postcode"
                  value={editMode ? editData.address.postcode : userData.address.postcode}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={editMode ? editData.address.country : userData.address.country}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  margin="normal"
                />
              </Box>
            </Stack>
          </Paper>
        </TabPanel>

        {/* Account Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Password & Security
          </Typography>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="body1" gutterBottom>
              Change your password or update security settings.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>
          </Paper>
        </TabPanel>
      </Paper>
      
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;
