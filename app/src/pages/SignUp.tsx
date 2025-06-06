import React from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, Navigate, useNavigate as useNavigateOriginal } from 'react-router-dom';

// Custom withRouter HOC for React Router v6
const withRouter = (Component: React.ComponentType<any>) => {
  const Wrapper = (props: any) => {
    const navigate = useNavigateOriginal();
    return <Component {...props} navigate={navigate} />;
  };
  return Wrapper;
};
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { UserData } from '../models/User'; // Removed unused imports
import { authentication } from '../api';
import { sharedCustomer } from '../models';

interface SignUpViewState {
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: 'M' | 'F' | '';
    address: string;
  };
  showPassword: boolean;
  showConfirmPassword: boolean;
  errors: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
    address: string;
    form: string;
  };
  isSubmitting: boolean;
  isRegistered: boolean;
  registrationSuccess: boolean;
}

interface SignUpViewProps {
  navigate: (path: string) => void;
}

class SignUpView extends React.Component<SignUpViewProps, SignUpViewState> {
  constructor(props: SignUpViewProps) {
    super(props);
    this.state = {
      formData: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        address: '',
      },
      showPassword: false,
      showConfirmPassword: false,
      errors: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        address: '',
        form: ''
      },
      isSubmitting: false,
      isRegistered: false,
      registrationSuccess: false
    };
  }

  private validateName = (name: string, field: 'first_name' | 'last_name'): boolean => {
    if (!name.trim()) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          [field]: `${field === 'first_name' ? 'First' : 'Last'} name is required`
        }
      }));
      return false;
    }
    
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [field]: ''
      }
    }));
    return true;
  };

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
    
    if (password.length < 8) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          password: 'Password must be at least 8 characters'
        }
      }));
      return false;
    }
    
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          password: 'Password must include uppercase, lowercase, and number'
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

  private validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
    if (!confirmPassword) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          confirmPassword: 'Please confirm your password'
        }
      }));
      return false;
    }
    
    if (confirmPassword !== password) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          confirmPassword: 'Passwords do not match'
        }
      }));
      return false;
    }
    
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        confirmPassword: ''
      }
    }));
    return true;
  };

  private validateGender = (gender: string): boolean => {
    if (!gender) {
      this.setState(prevState => ({
        errors: {
          ...prevState.errors,
          gender: 'Gender is required'
        }
      }));
      return false;
    }
    
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        gender: ''
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

  private handleSelectChange = (e: SelectChangeEvent): void => {
    const { name, value } = e.target;
    
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      } as any
    }));
  };

  private togglePasswordVisibility = (field: 'password' | 'confirmPassword'): void => {
    if (field === 'password') {
      this.setState(prevState => ({
        showPassword: !prevState.showPassword
      }));
    } else {
      this.setState(prevState => ({
        showConfirmPassword: !prevState.showConfirmPassword
      }));
    }
  };

  private handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    this.setState({ isSubmitting: true });
    
    const { first_name, last_name, email, password, confirmPassword, gender, address } = this.state.formData;
    
    // Reset form error
    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        form: ''
      }
    }));

    // Validate all fields
    const isFirstNameValid = this.validateName(first_name, 'first_name');
    const isLastNameValid = this.validateName(last_name, 'last_name');
    const isEmailValid = this.validateEmail(email);
    const isPasswordValid = this.validatePassword(password);
    const isConfirmPasswordValid = this.validateConfirmPassword(confirmPassword, password);
    const isGenderValid = this.validateGender(gender);
    
    if (isFirstNameValid && isLastNameValid && isEmailValid && 
        isPasswordValid && isConfirmPasswordValid && isGenderValid) {
      
      // Create user data object
      const userData: UserData = {
        account_type: 'CUSTOMER', // Always register as customer
        first_name,
        last_name,
        email,
        password,
        gender: gender as 'M' | 'F',
        address: address // Use the address string directly from form data
      };
      
      try {
        // Use the User model to register a new user
        console.log('Attempting to create user with data:', userData);
        const response = await authentication.createUser(userData);
        console.log('Registration response:', response);
        
        if (response) {
          // Redirect to login page after successful registration
          console.log('Redirecting to login page...');
          this.setState({ 
            isSubmitting: false,
            registrationSuccess: true
          });
          const users = await authentication.getAllUsers();
          if (users && users.length > 0) {
            const lastUser = users[users.length - 1];
            await sharedCustomer.updateProfile(lastUser);
          }

          // Show success message and redirect to profile
          setTimeout(() => {
            this.props.navigate('/profile');
          }, 1500);
        } else {
          this.setState({
            errors: {
              ...this.state.errors,
              form: 'Registration failed. The email may already be in use.'
            },
            isSubmitting: false
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.setState({
          errors: {
            ...this.state.errors,
            form: 'An unexpected error occurred'
          },
          isSubmitting: false
        });
      }
    } else {
      this.setState({ 
        isSubmitting: false,
        errors: {
          ...this.state.errors,
          form: 'Please correct the errors in the form'
        }
      });
    }
  };

  render() {
    const { 
      formData, 
      showPassword, 
      showConfirmPassword, 
      errors, 
      isSubmitting, 
      isRegistered,
      registrationSuccess 
    } = this.state;

    if (isRegistered) {
      return <Navigate to="/login" />;
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
            alignItems: 'center',
            mb: 4
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
            <PersonAddIcon sx={{ color: 'white' }} />
          </Box>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create an Account
          </Typography>

          {registrationSuccess && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Account created successfully! Redirecting to profile page...
            </Alert>
          )}

          {errors.form && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {errors.form}
            </Alert>
          )}

          <Box component="form" onSubmit={this.handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <TextField
                autoComplete="given-name"
                name="first_name"
                required
                fullWidth
                id="first_name"
                label="First Name"
                autoFocus
                value={formData.first_name}
                onChange={this.handleInputChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
              <TextField
                required
                fullWidth
                id="last_name"
                label="Last Name"
                name="last_name"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={this.handleInputChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </Box>
            
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={this.handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
              />
              
              <FormControl fullWidth required error={!!errors.gender}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={this.handleSelectChange}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error">
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
              
              <TextField
                fullWidth
                id="address"
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={this.handleInputChange}
              />
              
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={this.handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => this.togglePasswordVisibility('password')}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={this.handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => this.togglePasswordVisibility('confirmPassword')}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            
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
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }
}

// Wrap the component with our custom withRouter HOC
export default withRouter(SignUpView);
