import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import { User } from '../models/User';
import { Authentication } from '../server/api';
import { sharedCustomer, sharedStaff } from '../models';


interface LoginViewState {
  formData: {
    email: string;
    password: string;
  };
  showPassword: boolean;
  errors: {
    email: string;
    password: string;
    login: string;
  };
  isAuthenticated: boolean;
  isSubmitting: boolean;
  redirectTo: string | null;
}

class LoginView extends React.Component<{}, LoginViewState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {
        email: 'agosneye0@oakley.com',
        password: 'mF1.X7Jt{|?S'
      },
      showPassword: false,
      errors: {
        email: '',
        password: '',
        login: ''
      },
      isAuthenticated: false,
      isSubmitting: false,
      redirectTo: null
    };
  }

  componentDidMount() {
    // Check if user is already authenticated
    if (User.isAuthenticated()) {
      this.setState({ isAuthenticated: true });
    }

    // Check for redirect from URL query params
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      this.setState({ redirectTo: redirect });
    }
  }

  private validateEmail = (email: string): boolean => {
    if (!email) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          email: 'Email is required'
        }
      }));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          email: 'Please enter a valid email address'
        }
      }));
      return false;
    }
    
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        email: ''
      }
    }));
    return true;
  };

  private validatePassword = (password: string): boolean => {
    if (!password) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          password: 'Password is required'
        }
      }));
      return false;
    }
    
    // Basic password validation
    if (password.length < 6) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          password: 'Password must be at least 6 characters'
        }
      }));
      return false;
    }
    
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        password: ''
      }
    }));
    return true;
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  };

  private togglePasswordVisibility = (): void => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  };

  private handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    this.setState({ isSubmitting: true });
    
    const { email, password } = this.state.formData;
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        login: ''
      }
    }));

    const isEmailValid = this.validateEmail(email);
    const isPasswordValid = this.validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      try {
        const response = await Authentication.loginUser(email, password)
        if (response) {
          this.setState({ 
            isAuthenticated: true,
            isSubmitting: false
          });
          if (response.account_type === 'STAFF') {
            sharedStaff.updateProfile({
              first_name: response.first_name,
              last_name: response.last_name,
              email: response.email,
              gender: response.gender as 'M' | 'F',
              address: response.address,
              password: response.password,
              account_type: response.account_type as 'STAFF' | 'CUSTOMER',
              uid: Number(response.uid),
            });
          } else {
            console.log('Processing customer login...');
            
            // Create a clean user data object
            const userData = {
              first_name: response.first_name || '',
              last_name: response.last_name || '',
              email: response.email || '',
              gender: (response.gender as 'M' | 'F') || 'M',
              address: response.address || '',
              password: response.password || '',
              account_type: (response.account_type as 'CUSTOMER' | 'STAFF') || 'CUSTOMER',
              uid: Number(response.uid)
            };
            
            console.log('Updating customer profile with:', userData);
            
            // Update the customer profile with all the data
            const updateSuccess = await sharedCustomer.updateProfile(userData);
            
            if (updateSuccess) {
              console.log('Profile update successful');
              console.log('Customer email after update:', sharedCustomer.getEmail());
              console.log('Customer UID after update:', sharedCustomer.getUid());
              console.log('Full customer state after update:', {
                fullName: sharedCustomer.getFullName(),
                email: sharedCustomer.getEmail(),
                accountType: sharedCustomer.getAccountType(),
                uid: sharedCustomer.getUid()
              });
            } else {
              console.error('Failed to update customer profile');
            }
          }
        } else {
          this.setState({
            errors: {
              ...this.state.errors,
              login: response || 'Authentication failed'
            },
            isSubmitting: false
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        this.setState({
          errors: {
            ...this.state.errors,
            login: 'An unexpected error occurred'
          },
          isSubmitting: false
        });
      }
    } else {
      this.setState({ isSubmitting: false });
    }
  };

  render() {
    const { formData, showPassword, errors, isAuthenticated, isSubmitting, redirectTo } = this.state;

    if (isAuthenticated) {
      return <Navigate to={redirectTo || "/profile"} />;
    }

    return (
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            mt: 8, 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'primary.main', 
            borderRadius: '50%', 
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <LockOutlinedIcon sx={{ color: 'white' }} />
          </Box>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Sign in to AWE Electronics
          </Typography>

          {errors.login && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errors.login}
            </Alert>
          )}

          <Box component="form" onSubmit={this.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={this.handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={this.handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={this.togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              ) : null}
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup" variant="body2">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }
}

export default LoginView;
