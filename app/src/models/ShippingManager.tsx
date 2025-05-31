import React from 'react';
import { TextField, Box } from '@mui/material';

type ShippingFormData = {
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
};

type FormErrors = {
  streetAddress?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
};

type ShippingFormProps = {
  onChange?: (data: ShippingFormData, isValid: boolean) => void;
  onValidityChange: (isValid: boolean) => void;
  readOnly?: boolean;
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
  // Add public method to get form data
  public getFormData(): ShippingFormData | null {
    const { formData } = this.state;
    // Basic validation to ensure all required fields are filled
    const requiredFields: (keyof ShippingFormData)[] = ['streetAddress', 'suburb', 'state', 'postcode'];
    const isValid = requiredFields.every(field => {
      const value = formData[field];
      return value && value.trim().length > 0;
    });
    
    return isValid ? { ...formData } : null;
  }
  constructor(props: ShippingFormProps) {
    super(props);
    this.state = {
      formData: {
        streetAddress: '',
        suburb: '',
        state: '',
        postcode: ''
      },
      errors: {},
      touched: {
        streetAddress: false,
        suburb: false,
        state: false,
        postcode: false
      },
      isFormValid: false
    };
  }

  componentDidMount() {
    // Initialize form without showing errors
    this.validateFormAndNotify();
  }

  private validateField = (name: string, value: string, touched: boolean): string | undefined => {
    // Only validate required fields if the field has been touched or has a value
    if ((!value || value.trim().length === 0) && touched) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    const trimmedValue = value.trim();
    
    // Enhanced validation patterns with better error messages
    const patterns = {
      streetAddress: /^[a-zA-Z0-9\s,.-]{5,100}$/,
      suburb: /^[a-zA-Z\s-]{2,50}$/,
      state: /^(VIC|NSW|QLD|TAS|SA|WA|NT|ACT)$/i,
      postcode: /^\d{4}$/
    };

    const errorMessages = {
      streetAddress: 'Please enter a valid street address (5-100 characters, alphanumeric and basic punctuation)',
      suburb: 'Please enter a valid suburb (2-50 letters, spaces and hyphens only)',
      state: 'Please select a valid Australian state/territory (VIC, NSW, QLD, TAS, SA, WA, NT, or ACT)',
      postcode: 'Please enter a valid 4-digit postcode'
    };

    // Pattern validation
    if (patterns[name as keyof typeof patterns] && 
        !patterns[name as keyof typeof patterns].test(trimmedValue)) {
      return errorMessages[name as keyof typeof errorMessages];
    }

    // Additional postcode validation for Australian states
    if (name === 'postcode' && this.state.formData.state) {
      const state = this.state.formData.state.toUpperCase();
      const postcode = parseInt(trimmedValue, 10);
      
      // Basic state-based postcode validation
      const stateRanges: Record<string, [number, number]> = {
        'NSW': [1000, 2599],
        'VIC': [3000, 3999],
        'QLD': [4000, 4999],
        'SA': [5000, 5799],
        'WA': [6000, 6797],
        'TAS': [7000, 7999],
        'NT': [800, 899],
        'ACT': [2600, 2618],
      };

      if (state in stateRanges) {
        const [min, max] = stateRanges[state];
        if (postcode < min || postcode > max) {
          return `Postcode does not match the selected state (${state})`;
        }
      }
    }

    return undefined;
  }

  private validateForm = (formData: ShippingFormData): FormErrors => {
    const errors: FormErrors = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      const isTouched = this.state.touched[key as keyof typeof this.state.touched];
      if (isTouched) {
        const error = this.validateField(key, value, true);
        if (error) {
          errors[key as keyof FormErrors] = error;
        }
      }
    });
    
    return errors;
  };

  private validateFormAndNotify = (): void => {
    const formErrors = this.validateForm(this.state.formData);
    
    // Check if all required fields are filled and valid
    const requiredFields: (keyof typeof this.state.formData)[] = ['streetAddress', 'suburb', 'state', 'postcode'];
    const allRequiredFieldsFilled = requiredFields.every(field => {
      const value = this.state.formData[field];
      return value && value.trim().length > 0;
    });
    
    // Check if there are any validation errors in the form
    const hasErrors = Object.values(formErrors).some(error => error !== undefined);
    
    // Form is only valid if all required fields are filled and there are no validation errors
    const isFormValid = allRequiredFieldsFilled && !hasErrors;
    
    console.log('Shipping form validation:', {
      formData: this.state.formData,
      errors: formErrors,
      isFormValid
    });
    
    this.setState(
      (prevState) => ({
        ...prevState,
        errors: formErrors,
        isFormValid,
      }),
      () => {
        this.props.onChange?.(this.state.formData, isFormValid);
        this.props.onValidityChange(isFormValid);
      }
    );
  };

  private handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (this.props.readOnly) return;
    
    const { name, value } = e.target;
    
    this.setState(prevState => {
      const touched = { ...prevState.touched, [name]: true };
      return {
        touched,
        errors: { 
          ...prevState.errors, 
          [name]: this.validateField(name, value, true) 
        }
      };
    }, this.validateFormAndNotify);
  };

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (this.props.readOnly) return;
    
    const { name, value } = e.target;
    this.setState(
      (prevState) => {
        const newFormData = {
          ...prevState.formData,
          [name]: value,
        };
        
        // Only validate touched fields
        const errors = { ...prevState.errors };
        if (prevState.touched[name as keyof typeof prevState.touched]) {
          const error = this.validateField(name, value, true);
          if (error) {
            errors[name as keyof typeof errors] = error;
          } else {
            delete errors[name as keyof typeof errors];
          }
        }
        
        // Check if form is valid
        const allFieldsFilled = Object.entries(newFormData).every(([key, val]) => {
          const isTouched = this.state.touched[key as keyof typeof this.state.touched];
          return !isTouched || (val && val.trim() !== '');
        });
        
        const isFormValid = Object.keys(errors).length === 0 && allFieldsFilled;

        return {
          formData: newFormData,
          errors,
          isFormValid,
        };
      },
      () => {
        this.props.onChange?.(this.state.formData, this.state.isFormValid);
        this.props.onValidityChange(this.state.isFormValid);
      }
    );
  };



  render() {
    const { formData, errors } = this.state;
    const { readOnly = false } = this.props;

    const textFieldProps = (name: keyof typeof formData) => ({
      fullWidth: true,
      margin: 'normal' as const,
      name,
      value: formData[name],
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      error: !!errors[name],
      helperText: errors[name],
      disabled: readOnly,
      InputProps: {
        readOnly,
      },
      InputLabelProps: {
        shrink: readOnly ? true : undefined,
      },
      ...(readOnly ? { variant: 'filled' as const } : { variant: 'outlined' as const })
    });

    return (
      <Box component="form" noValidate autoComplete="off">
        <TextField
          {...textFieldProps('streetAddress')}
          label="Street Address"
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            {...textFieldProps('suburb')}
            label="Suburb"
          />
          <TextField
            {...textFieldProps('state')}
            label="State"
          />
          <TextField
            {...textFieldProps('postcode')}
            label="Postcode"
            inputProps={{ maxLength: 4 }}
          />
        </Box>
      </Box>
    );
  }
}

export default ShippingForm;