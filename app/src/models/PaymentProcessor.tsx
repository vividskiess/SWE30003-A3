import { TextField, Box, Button, Typography } from '@mui/material';
import * as React from 'react';

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

  // Removed unused methods to clean up the code
  // Helper methods can be added back if needed in the future

  private handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!this.state.isFormValid) return;
    
    this.setState({ isSubmitting: true, submitError: null });
    
    try {
      // In a real app, you would call your payment service here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState({ isSubmitted: true });
      
      if (this.props.onPaymentProcessed) {
        this.props.onPaymentProcessed(true, this.state.formData);
      }
      
      if (this.props.onValidityChange) {
        this.props.onValidityChange(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      this.setState({ 
        submitError: errorMessage,
        isSubmitting: false 
      });
      
      if (this.props.onPaymentProcessed) {
        this.props.onPaymentProcessed(false, { error: errorMessage });
      }
    }
  };

  render() {
    const { readOnly } = this.props;
    const { isSubmitting, isSubmitted, submitError } = this.state;

    if (isSubmitted) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="success.main" gutterBottom>
            Payment information verified
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => this.setState({ isSubmitted: false })}
            sx={{ mt: 2 }}
          >
            Edit Payment
          </Button>
        </Box>
      );
    }

    return (
      <Box component="form" noValidate autoComplete="off" onSubmit={this.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Card Number"
          name="cardNumber"
          value={this.state.formData.cardNumber}
          onChange={this.handleCardNumberChange}
          onBlur={this.handleBlur}
          error={!!this.state.errors.cardNumber}
          helperText={this.state.errors.cardNumber}
          inputProps={{ maxLength: 19 }}
          disabled={readOnly || isSubmitting}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Expiry Date (MM/YY)"
            name="expiryDate"
            value={this.state.formData.expiryDate}
            onChange={this.handleExpiryDateChange}
            onBlur={this.handleBlur}
            error={!!this.state.errors.expiryDate}
            helperText={this.state.errors.expiryDate}
            inputProps={{ maxLength: 5 }}
            disabled={readOnly || isSubmitting}
          />
          <TextField
            fullWidth
            label="CVV"
            name="cvv"
            value={this.state.formData.cvv}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            error={!!this.state.errors.cvv}
            helperText={this.state.errors.cvv}
            inputProps={{ maxLength: 4 }}
            disabled={readOnly || isSubmitting}
          />
        </Box>
        
        {submitError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {submitError}
          </Typography>
        )}
        
        {!readOnly && (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!this.state.isFormValid || isSubmitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {isSubmitting ? 'Processing...' : 'Verify Payment'}
          </Button>
        )}
      </Box>
    );
  }
}