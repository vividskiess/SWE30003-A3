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

  private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (this.props.readOnly) return;
    
    const { name, value } = e.target;
    this.setState(
      (prevState) => {
        const newFormData = {
          ...prevState.formData,
          [name]: value,
        };
        const errors = this.validateForm(newFormData);
        const allFieldsFilled = Object.values(newFormData).every((val) => val.trim() !== '');
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
    const { formData, errors, touched } = this.state;
    const { readOnly = false } = this.props;

    const textFieldProps = (name: keyof typeof formData) => ({
      fullWidth: true,
      margin: 'normal' as const,
      name,
      value: formData[name],
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      error: touched[name] && !!errors[name],
      helperText: touched[name] && errors[name],
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
        <TextField
          {...textFieldProps('country')}
          label="Country"
        />
      </Box>
    );
  }
}

export default ShippingForm;