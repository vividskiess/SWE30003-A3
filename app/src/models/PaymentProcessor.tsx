import { TextField, Box } from '@mui/material';
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
  onChange?: (data: PaymentFormData, isValid: boolean) => void;
  onValidityChange?: (isValid: boolean) => void;
};

type PaymentFormState = {
  formData: PaymentFormData;
  errors: FormErrors;
  touched: {
    [key: string]: boolean;
  };
  isFormValid: boolean;
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
      isFormValid: false
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
    
    if (this.props.onChange) {
      this.props.onChange(this.state.formData, isFormValid);
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

  private getHelperText(field: keyof FormErrors): string | undefined {
    return this.state.touched[field] ? this.state.errors[field] : undefined;
  }

  private isFieldValid(field: keyof FormErrors): boolean {
    return !this.state.touched[field] || !this.state.errors[field];
  }

  render() {
    const { formData } = this.state;
    
    return (
      <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
        <TextField
          fullWidth
          required
          name="cardNumber"
          label="Card Number"
          variant="outlined"
          margin="normal"
          value={formData.cardNumber}
          onChange={this.handleCardNumberChange}
          onBlur={this.handleBlur}
          error={!this.isFieldValid('cardNumber')}
          helperText={this.getHelperText('cardNumber')}
          placeholder="1234 5678 9012 3456"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            required
            name="expiryDate"
            label="Expiry Date (MM/YY)"
            variant="outlined"
            value={formData.expiryDate}
            onChange={this.handleExpiryDateChange}
            onBlur={this.handleBlur}
            error={!this.isFieldValid('expiryDate')}
            helperText={this.getHelperText('expiryDate')}
            placeholder="MM/YY"
          />
          <TextField
            fullWidth
            required
            name="cvv"
            label="CVV"
            variant="outlined"
            value={formData.cvv}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            error={!this.isFieldValid('cvv')}
            helperText={this.getHelperText('cvv')}
            placeholder="123"
          />
        </Box>
      </Box>
    );
  }
}