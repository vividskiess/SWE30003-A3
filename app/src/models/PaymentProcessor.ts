import { TextField, Box, Button, Typography } from '@mui/material';
import * as React from 'react';
import { paymentService } from './PaymentService';

type PaymentFormData = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

type FormErrors = {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
};

type PaymentFormProps = {
  amount: number;
  onPaymentProcessed?: (success: boolean, data?: any) => void;
  onValidityChange?: (isValid: boolean) => void;
  onEdit?: () => void;
  readOnly?: boolean;
};

type PaymentFormState = {
  formData: PaymentFormData;
  errors: FormErrors;
  touched: {
    [key: string]: boolean;
  };
  isFormValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
};

export class PaymentForm extends React.Component<PaymentFormProps, PaymentFormState> {
  constructor(props: PaymentFormProps) {
    super(props);
    this.state = {
      formData: {
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      },
      errors: {},
      touched: {
        cardNumber: false,
        expiryDate: false,
        cvv: false
      },
      isFormValid: false,
      isSubmitting: false,
      isSubmitted: false,
      submitError: null
    };
  }

  componentDidMount() {
    // Initial validation check
    this.validateFormAndNotify();
  }

  private formatCardNumber(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  }

  private formatExpiryDate(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  }

  private validateField(name: string, value: string): string | undefined {
    switch (name) {
      case 'cardNumber':
        if (!value) return 'Card number is required';
        if (!/^\d{13,19}$/.test(value.replace(/\s/g, ''))) return 'Invalid card number';
        break;
      case 'expiryDate':
        if (!value) return 'Expiry date is required';
        if (!/^\d{2}\/\d{2}$/.test(value)) return 'Invalid expiry date format (MM/YY)';
        // Additional validation for expiry date
        const [month, year] = value.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        
        if (month < 1 || month > 12) return 'Invalid month';
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          return 'Card has expired';
        }
        break;
      case 'cvv':
        if (!value) return 'CVV is required';
        if (!/^\d{3,4}$/.test(value)) return 'Invalid CVV';
        break;
    }
    return undefined;
  }

  private validateForm(formData: PaymentFormData): FormErrors {
    const errors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = this.validateField(key, formData[key as keyof PaymentFormData]);
      if (error) {
        errors[key as keyof FormErrors] = error;
      }
    });
    return errors;
  }

  private validateFormAndNotify = (): void => {
    const formErrors = this.validateForm(this.state.formData);
    const allFieldsFilled = Object.values(this.state.formData).every(val => val.trim() !== '');
    const isFormValid = Object.keys(formErrors).length === 0 && allFieldsFilled;
    
    // Only update state if there's a change to prevent unnecessary re-renders
    if (this.state.isFormValid !== isFormValid) {
      this.setState({ isFormValid }, () => {
        if (this.props.onValidityChange) {
          this.props.onValidityChange(isFormValid);
        }
      });
    }
  }

  private handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target as HTMLInputElement;
    this.setState(prevState => ({
      touched: { ...prevState.touched, [name]: true },
      errors: { ...prevState.errors, [name]: this.validateField(name, value) }
    }));
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const newData = { ...this.state.formData, [name]: value };
    const errors = { ...this.state.errors };
    
    // Clear error when user types
    if (this.state.touched[name]) {
      const error = this.validateField(name, value);
      if (error) {
        errors[name as keyof FormErrors] = error;
      } else {
        delete errors[name as keyof FormErrors];
      }
    }

    this.setState({ 
      formData: newData,
      errors
    }, this.validateFormAndNotify);
  };

  private handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formatted = this.formatCardNumber(e.target.value);
    const newData = { 
      ...this.state.formData, 
      cardNumber: formatted.replace(/\s/g, '') 
    };
    
    const errors = { ...this.state.errors };
    if (this.state.touched.cardNumber) {
      const error = this.validateField('cardNumber', newData.cardNumber);
      if (error) {
        errors.cardNumber = error;
      } else {
        delete errors.cardNumber;
      }
    }

    this.setState({ 
      formData: newData,
      errors
    }, this.validateFormAndNotify);
    
    e.target.value = formatted;
  };

  private handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formatted = this.formatExpiryDate(e.target.value);
    const newData = { 
      ...this.state.formData, 
      expiryDate: formatted 
    };
    
    const errors = { ...this.state.errors };
    if (this.state.touched.expiryDate) {
      const error = this.validateField('expiryDate', newData.expiryDate);
      if (error) {
        errors.expiryDate = error;
      } else {
        delete errors.expiryDate;
      }
    }

    this.setState({ 
      formData: newData,
      errors
    }, this.validateFormAndNotify);
    
    e.target.value = formatted;
  };

  private handleEdit = (): void => {
    // First call the parent's onEdit handler to update the verification state
    if (this.props.onEdit) {
      this.props.onEdit();
    }

    // Then update the local state
    this.setState({
      isSubmitted: false,
      submitError: null,
      isSubmitting: false,
      isFormValid: false,
      errors: {},
      // Keep the existing form data
      // Mark all fields as touched to show any validation errors
      touched: {
        cardNumber: true,
        expiryDate: true,
        cvv: true
      }
    }, () => {
      // Re-validate the form after enabling edit mode
      this.validateFormAndNotify();
      
      // Notify parent about the validity change
      if (this.props.onValidityChange) {
        this.props.onValidityChange(false);
      }
    });
  };

  // Removed unused methods to clean up the code
  // Helper methods can be added back if needed in the future

  private handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!this.state.isFormValid) return;
    
    this.setState({ 
      isSubmitting: true, 
      submitError: null,
      // Mark all fields as touched to show any validation errors
      touched: {
        cardNumber: true,
        expiryDate: true,
        cvv: true
      }
    });
    
    try {
      // Format the card number to match the service's format (remove spaces)
      const cardNumber = this.state.formData.cardNumber.replace(/\s+/g, '');
      
      // Create payment details object for validation
      const paymentDetails = {
        cardNumber,
        expiryDate: this.state.formData.expiryDate,
        cvv: this.state.formData.cvv,
        cardHolderName: 'VALID CARD',
        amount: this.props.amount
      };
      
      // Validate payment details against the payment service
      const response = await paymentService.processPayment(paymentDetails);
      
      if (response.success) {
        // First, send the complete form data to the parent
        if (this.props.onPaymentProcessed) {
          this.props.onPaymentProcessed(true, this.state.formData);
        }
        
        // Then update the local state with cleared CVV for security
        this.setState(prevState => {
          const updatedFormData = {
            ...prevState.formData,
            cvv: '' // Clear CVV for security in the UI
          };
          
          if (this.props.onValidityChange) {
            this.props.onValidityChange(true);
          }
          
          return {
            isSubmitted: true,
            isSubmitting: false,
            errors: {},
            formData: updatedFormData
          };
        });
      } else {
        throw new Error(response.error || 'Payment verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      
      this.setState(prevState => {
        // Call callbacks with the updated state
        if (this.props.onPaymentProcessed) {
          this.props.onPaymentProcessed(false, { error: errorMessage });
        }
        
        if (this.props.onValidityChange) {
          this.props.onValidityChange(false);
        }
        
        // Return the new state
        return {
          submitError: errorMessage,
          isSubmitting: false,
          formData: {
            ...prevState.formData
          }
        };
      });
    }
  };

  public render() {
    const { readOnly } = this.props;
    const { formData, errors, touched, isSubmitting, isSubmitted, submitError } = this.state;
    // Only show read-only view if we're not in edit mode and there's no submission error
    const isFormReadOnly = readOnly && isSubmitted && !submitError && !isSubmitting;

    return (
      <Box component="form" onSubmit={this.handleSubmit} noValidate>
        {submitError && !isFormReadOnly && (
          <Typography color="error" sx={{ mb: 2 }}>
            {submitError}
          </Typography>
        )}

        {isFormReadOnly ? (
          <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>Card ending in {formData.cardNumber.slice(-4)}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Expires: {formData.expiryDate}</Typography>
            <Button 
              type="button"
              variant="outlined" 
              size="small"
              onClick={this.handleEdit}
              sx={{ mt: 1 }}
            >
              Edit Card Details
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Box sx={{ mb: 1 }}>
              <TextField
                label="Card Number"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={this.handleCardNumberChange}
                onBlur={this.handleBlur}
                error={touched.cardNumber && !!errors.cardNumber}
                helperText={touched.cardNumber ? errors.cardNumber : ' '}
                FormHelperTextProps={{ style: { height: '20px', marginTop: 0 } }}
                disabled={isSubmitting}
                fullWidth
                placeholder="1234 5678 9012 3456"
                inputProps={{ 
                  maxLength: 19,
                  autoComplete: 'cc-number'
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Expiry Date (MM/YY)"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={this.handleExpiryDateChange}
                  onBlur={this.handleBlur}
                  error={touched.expiryDate && !!errors.expiryDate}
                  helperText={touched.expiryDate ? errors.expiryDate : ' '}
                  FormHelperTextProps={{ style: { height: '20px', marginTop: 0 } }}
                  disabled={isSubmitting}
                  placeholder="MM/YY"
                  fullWidth
                  inputProps={{ 
                    maxLength: 5,
                    autoComplete: 'cc-exp'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  label="CVV"
                  name="cvv"
                  type="password"
                  value={formData.cvv}
                  onChange={this.handleInputChange}
                  onBlur={this.handleBlur}
                  error={touched.cvv && !!errors.cvv}
                  helperText={touched.cvv ? errors.cvv : ' '}
                  FormHelperTextProps={{ style: { height: '20px', marginTop: 0 } }}
                  disabled={isSubmitting}
                  placeholder="123"
                  fullWidth
                  inputProps={{ 
                    maxLength: 4,
                    autoComplete: 'cc-csc'
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 1, mb: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!this.state.isFormValid || isSubmitting}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'medium'
                }}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Payment'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
}