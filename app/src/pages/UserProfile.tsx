import React from 'react';
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

import { sharedCustomer, sharedStaff, sharedOrder, sharedCart } from "../models";
import { User } from "../models/User";

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
// Remove unused import
import { UserData } from '../models/User.tsx';


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


interface UserProfileState {
  tabValue: number,
  editMode: boolean,
  editData: UserData ,
  successMessage: string,
  userData: UserData,
  errors: {
    // name?: string;
    // price?: string;
    // qty?: string;
    // description?: string;
  };
}

class UserProfile extends React.Component<{}, UserProfileState > {
  private unsubscribe: (() => void) | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    
    this.state = {
      tabValue: 0,
      editMode: false,
      editData: {
        first_name: '',
        last_name: '',
        email: '',
        address: {
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: ''
        },
      },
      successMessage: '',
      userData: {
        first_name: '',
        last_name: '',
        email: '',
        address: {
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: ''
        },
      },

      errors: {

      }
    };
  }

  componentDidMount() {
    // Try to get user data from shared instances
    const updateUserData = () => {
      try {
        const user = User['currentUser'] as any;
        const customerData = sharedCustomer.getCustomerDetails?.() || {};
        const staffData = sharedStaff.getCustomerDetails?.() || {};
        const userData = user?.getCustomerDetails?.() || customerData || staffData;
        
        if (userData?.email) { // Only update if we have valid user data
          this.setState({ 
            userData,
            editData: userData
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    // Initial update
    updateUserData();
    
    // Check for updates periodically
    this.updateInterval = setInterval(updateUserData, 5000);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Mock order history
  private orderHistory = [
    { id: 'ORD-001', date: '2025-05-01', status: 'Delivered', total: 125.99 },
    { id: 'ORD-002', date: '2025-04-15', status: 'Delivered', total: 79.50 },
    { id: 'ORD-003', date: '2025-03-22', status: 'Delivered', total: 214.75 }
  ];



  private handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    this.setState({ tabValue: newValue })
  };

  private handleEditToggle = () => {
    if (this.state.editMode) {
      // Cancel edit
      this.setState({ editData: this.state.userData });
    }
    this.setState({ editMode: !this.state.editMode });
  };

  private handleSaveProfile = () => {
    this.setState({ userData: this.state.editData })
    this.setState({ editMode: false })
    this.setState({ successMessage: "Profile updated succesfully!" })
  };

  private handleSignOut = () => {
    try {
      // Clear cart by removing all items
      const cartItems = sharedCart.getItems();
      cartItems.forEach(([productId]) => {
        sharedCart.removeProduct(productId);
      });
      
      // Clear order data by creating a new order instance
      Object.assign(sharedOrder, new (sharedOrder.constructor as any)());
      
      // Clear auth token and user data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Clear current user using the static logout method
      User.logout();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still redirect to login even if there was an error
      window.location.href = '/login';
    }
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');

      this.setState(prevState => ({
        editData: {
          ...prevState.editData,
          [parent]: {
            ...(prevState.editData[parent as keyof typeof prevState.editData] as any),
            [child]: value
          }
        }
      }))
      
      // setEditData(prev => ({
      //   ...prev,
      //   [parent]: {
      //     ...prev[parent as keyof typeof prev] as any,
      //     [child]: value
      //   }
      // }));
    } else {
      this.setState(prevState => ({
        editData: {
          ...prevState.editData,
          [name]: value
        }
      }))
      // setEditData(prev => ({
      //   ...prev,
      //   [name]: value
      // }));
    }
  };

  private handleCloseSnackbar = (): void => {
    this.setState({ successMessage: '' })
  };

  render() {
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
              {(this.state.userData.first_name?.charAt(0) || '')}{(this.state.userData.last_name?.charAt(0) || '')}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {this.state.userData.first_name} {this.state.userData.last_name}
              </Typography>
              <Typography variant="body1">
                {this.state.userData.email}
              </Typography>
            </Box>
          </Box>

          {/* Profile Content */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={this.state.tabValue} 
              onChange={this.handleTabChange} 
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
          <TabPanel value={this.state.tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={this.state.editMode ? <SaveIcon /> : <EditIcon />}
                onClick={this.state.editMode ? this.handleSaveProfile : this.handleEditToggle}
                sx={{ mt: 2, mr: 2 }}
              >
                {this.state.editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={this.handleSignOut}
                sx={{ mt: 2 }}
              >
                Sign Out
              </Button>
              {this.state.editMode && (
                <Button 
                  startIcon={<SaveIcon />}
                  onClick={this.handleSaveProfile}
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
                  name="first_name"
                  value={this.state.editMode ? this.state.editData.first_name : this.state.userData.first_name}
                  onChange={this.handleInputChange}
                  disabled={!this.state.editMode}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={this.state.editMode ? this.state.editData.last_name : this.state.userData.last_name}
                  onChange={this.handleInputChange}
                  disabled={!this.state.editMode}
                  margin="normal"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={this.state.editMode ? this.state.editData.email : this.state.userData.email}
                  onChange={this.handleInputChange}
                  disabled={!this.state.editMode}
                  margin="normal"
                />
                {/* <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={this.state.editMode ? this.state.editData.phone : this.state.userData.phone}
                  onChange={this.handleInputChange}
                  disabled={!this.state.editMode}
                  margin="normal"
                /> */}
              </Box>
            </Stack>
          </TabPanel>

          {/* Order History Tab */}
          <TabPanel value={this.state.tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Your Previous Orders
            </Typography>
            <List>
              {this.orderHistory.map((order) => (
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
          <TabPanel value={this.state.tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={this.state.editMode ? this.state.editData.address?.street : this.state.userData.address?.street}
                  onChange={this.handleInputChange}
                  disabled={!this.state.editMode}
                  margin="normal"
                />
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="City"
                    name="address.city"
                    value={this.state.editMode ? this.state.editData.address?.city : this.state.userData.address?.city}
                    onChange={this.handleInputChange}
                    disabled={!this.state.editMode}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="State/Province"
                    name="address.state"
                    value={this.state.editMode ? this.state.editData.address?.state : this.state.userData.address?.state}
                    onChange={this.handleInputChange}
                    disabled={!this.state.editMode}
                    margin="normal"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="address.postcode"
                    value={this.state.editMode ? this.state.editData.address?.postcode : this.state.userData.address?.postcode}
                    onChange={this.handleInputChange}
                    disabled={!this.state.editMode}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    name="address.country"
                    value={this.state.editMode ? this.state.editData.address?.country : this.state.userData.address?.country}
                    onChange={this.handleInputChange}
                    disabled={!this.state.editMode}
                    margin="normal"
                  />
                </Box>
              </Stack>
            </Paper>
          </TabPanel>

          {/* Account Security Tab */}
          <TabPanel value={this.state.tabValue} index={3}>
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
          open={!!this.state.successMessage} 
          autoHideDuration={6000} 
          onClose={this.handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={this.handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {this.state.successMessage}
          </Alert>
        </Snackbar>
      </Container>
  );
  }

};

export default UserProfile;
