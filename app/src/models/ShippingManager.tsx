import React from 'react';
import { TextField, Box } from '@mui/material';

type ShippingFormData = {
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
};

type FormErrors = {
  streetAddress?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type ShippingFormProps = {
  onChange: (data: ShippingFormData, isValid: boolean) => void;
  onValidityChange: (isValid: boolean) => void;
};

type ShippingFormState = {
  formData: ShippingFormData;
  errors: FormErrors;
  touched: {
    [key: string]: boolean;
  };
  isFormValid: boolean;
};

export class ShippingForm extends React.Component<ShippingFormProps, ShippingFormState> {
  constructor(props: ShippingFormProps) {
    super(props);
    this.state = {
      formData: {
        streetAddress: '',
        suburb: '',
        state: '',
        postcode: '',
        country: '' // Start with empty country
      },
      errors: {},
      touched: {
        streetAddress: false,
        suburb: false,
        state: false,
        postcode: false,
        country: false
      },
      isFormValid: false
    };
  }

  componentDidMount() {
    this.validateFormAndNotify();
  }

  private validateField(name: string, value: string): string | undefined {
    switch (name) {
      case 'streetAddress':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 5) return 'Please enter a valid address';
        break;
      case 'suburb':
        if (!value.trim()) return 'Suburb is required';
        break;
      case 'state':
        if (!value.trim()) return 'State is required';
        break;
      case 'postcode':
        if (!/^\d{4}$/.test(value)) return 'Please enter a valid 4-digit postcode';
        break;
      case 'country':
        if (!value.trim()) return 'Country is required';
        break;
    }
    return undefined;
  }

  private validateForm(formData: ShippingFormData): FormErrors {
    const errors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = this.validateField(key, formData[key as keyof ShippingFormData]);
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
    
    console.log('Shipping form validation:', {
      formData: this.state.formData,
      errors: formErrors,
      allFieldsFilled,
      isFormValid,
      wasValid: this.state.isFormValid
    });
    
    // Always update the parent with current validity state
    this.props.onValidityChange(isFormValid);
    this.props.onChange(this.state.formData, isFormValid);
    
    // Update local state
    this.setState({ isFormValid });
  };

  private handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    console.log(`Field blurred: ${name}`, value);
    
    this.setState(prevState => {
      const newTouched = { ...prevState.touched, [name]: true };
      const newErrors = { ...prevState.errors, [name]: this.validateField(name, value) };
      
      console.log('Blur state update:', { name, value, newTouched, newErrors });
      
      return {
        touched: newTouched,
        errors: newErrors
      };
    }, this.validateFormAndNotify);
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name}`, value);
    
    this.setState(prevState => {
      const newData = { ...prevState.formData, [name]: value };
      const newErrors = { ...prevState.errors };
      
      // Clear error when user types
      if (prevState.touched[name]) {
        const error = this.validateField(name, value);
        if (error) {
          newErrors[name as keyof FormErrors] = error;
        } else {
          delete newErrors[name as keyof FormErrors];
        }
      }
      
      return {
        formData: newData,
        errors: newErrors
      };
    }, this.validateFormAndNotify);
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
          name="streetAddress"
          label="Street Address"
          variant="outlined"
          margin="normal"
          value={formData.streetAddress}
          onChange={this.handleInputChange}
          onBlur={this.handleBlur}
          error={!this.isFieldValid('streetAddress')}
          helperText={this.getHelperText('streetAddress')}
          placeholder="123 Example St"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            required
            name="suburb"
            label="Suburb"
            variant="outlined"
            value={formData.suburb}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            error={!this.isFieldValid('suburb')}
            helperText={this.getHelperText('suburb')}
          />
          <TextField
            fullWidth
            required
            name="state"
            label="State"
            variant="outlined"
            value={formData.state}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            error={!this.isFieldValid('state')}
            helperText={this.getHelperText('state')}
            placeholder="e.g. VIC, NSW, QLD"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            required
            name="postcode"
            label="Postcode"
            variant="outlined"
            value={formData.postcode}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            error={!this.isFieldValid('postcode')}
            helperText={this.getHelperText('postcode')}
          />
          <TextField
            fullWidth
            required
            name="country"
            label="Country"
            variant="outlined"
            value={formData.country}
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            error={!this.isFieldValid('country')}
            helperText={this.getHelperText('country')}
            placeholder="e.g. Australia, United States, etc."
          />
        </Box>
      </Box>
    );
  }
}

export default ShippingForm;