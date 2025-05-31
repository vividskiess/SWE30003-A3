import React from 'react';
import { Paper, Typography, Button, Box, CircularProgress, FormControlLabel, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import { ShippingForm } from '../models/ShippingManager';
import { shippingService } from '../models/ShippingService';
import { checkoutManager } from '../models/CheckoutManagerTest';

type ShippingOption = {
  id: string;
  companyId: string;
  name: string;
  companyName: string;
  description: string;
  price: number;
  estimatedDays: string;
  hasSurcharge?: boolean;
  surchargeAmount?: number;
  isFree?: boolean;
};

interface ShippingViewState {
  isCalculating: boolean;
  shippingOptions: ShippingOption[];
  selectedOption: string | null;
  error: string | null;
  isFormValid: boolean;
  isFormReadOnly: boolean;
}

interface ShippingViewProps {
  onNext?: () => void;
  onShippingOptionSelect?: (option: ShippingOption | null) => void;
}

// Export the ShippingForm type for use in CheckOutView
export type { ShippingForm } from '../models/ShippingManager';

interface ShippingViewRef {
  getFormData: () => any | null;
}

class ShippingViewComponent extends React.Component<ShippingViewProps, ShippingViewState> implements ShippingViewRef {
  public formRef = React.createRef<ShippingForm>();

  public getFormData = () => {
    if (!this.formRef.current) {
      console.error('Form reference not found');
      return null;
    }
    return this.formRef.current.getFormData();
  };

  constructor(props: ShippingViewProps) {
    super(props);
    this.state = {
      isCalculating: false,
      shippingOptions: [],
      selectedOption: null,
      error: null,
      isFormValid: false,
      isFormReadOnly: false
    };
  }

  private handleFormValidityChange = (isValid: boolean) => {
    const { selectedOption } = this.state;
    this.setState({ isFormValid: isValid });
    // Only update shipping validity if we have a selected option
    checkoutManager.handleShippingFormValidityChange(selectedOption !== null && isValid);
  };

  private handleEditShipping = () => {
    this.setState({
      isFormReadOnly: false,
      shippingOptions: [],
      selectedOption: null
      // Don't reset isFormValid to keep the form valid when editing
    });
    
    // Notify parent that shipping options were cleared
    if (this.props.onShippingOptionSelect) {
      this.props.onShippingOptionSelect(null);
    }
  };

  private handleCalculateShipping = async () => {
    this.setState({ isCalculating: true, error: null });
    
    try {
      // Get the form data from the ShippingForm component
      if (!this.formRef.current) {
        throw new Error('Form reference not available');
      }
      
      const formData = this.formRef.current.getFormData();
      
      if (!formData) {
        throw new Error('Shipping information is incomplete');
      }

      // Validate form data
      const requiredFields: (keyof typeof formData)[] = ['streetAddress', 'suburb', 'state', 'postcode'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate postcode format
      const postcode = formData.postcode?.toString() || '';
      if (!/^\d{4}$/.test(postcode)) {
        throw new Error('Please enter a valid 4-digit postcode');
      }

      // Validate state format (2-3 letter Australian state/territory code)
      const state = formData.state?.toString() || '';
      if (!/^(VIC|NSW|QLD|TAS|SA|WA|NT|ACT)$/i.test(state)) {
        throw new Error('Please enter a valid Australian state/territory code (e.g., VIC, NSW, QLD)');
      }

      // Calculate package weight based on cart items (simplified example)
      const packageWeight = 1.5; // In a real app, calculate this from cart items
      
      const response = await shippingService.calculateShipping(
        {
          streetAddress: formData.streetAddress,
          town: formData.suburb,
          state: formData.state,
          postcode: formData.postcode,
        },
        { 
          weight: packageWeight, 
          dimensions: {
            length: 30, 
            width: 20, 
            height: 10 
          },
          isFragile: false
        },
        1 // item count
      );
      
      console.log('Shipping response:', response); // Debug log

      if (response.success && response.methods) {
        const shippingOptions = response.methods.map((m: any) => ({
          id: m.id,
          companyId: m.companyId,
          name: m.name,
          companyName: m.companyName || m.name,
          description: `Estimated delivery: ${m.estimatedDays}${m.hasSurcharge ? ' (Additional fees may apply)' : ''}`,
          price: m.price,
          estimatedDays: m.estimatedDays,
          hasSurcharge: m.hasSurcharge,
          surchargeAmount: m.surchargeAmount,
          isFree: m.isFree
        }));

        this.setState({
          shippingOptions,
          isFormReadOnly: true,
          error: null
        });
        
        // If there are options, select the first one by default
        if (shippingOptions.length > 0) {
          const firstOption = shippingOptions[0];
          this.setState({ 
            selectedOption: firstOption.id,
            isFormValid: true 
          }, () => {
            this.handleFormValidityChange(true);
            if (this.props.onShippingOptionSelect) {
              this.props.onShippingOptionSelect(firstOption);
            }
          });
        } else {
          // If no options available, keep the form editable
          this.setState({ isFormReadOnly: false });
          checkoutManager.handleShippingFormValidityChange(false);
        }
      } else {
        this.setState({
          shippingOptions: [],
          selectedOption: null,
          error: response.error || 'Failed to calculate shipping options.',
          isFormReadOnly: false // Keep form editable on error
        });
        checkoutManager.handleShippingFormValidityChange(false);
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      this.setState({
        shippingOptions: [],
        selectedOption: null,
        error: 'An error occurred while calculating shipping options.',
        isFormReadOnly: false // Keep form editable on error
      });
      checkoutManager.handleShippingFormValidityChange(false);
    } finally {
      this.setState({ isCalculating: false });
    }
  };

  private handleOptionSelect = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    const selectedOption = this.state.shippingOptions.find(opt => opt.id === value);
    if (selectedOption) {
      this.setState({ selectedOption: value }, () => {
        // Update form validity with the new selection
        // We know the form is valid at this point since we have a selected option
        this.setState({ isFormValid: true }, () => {
          this.handleFormValidityChange(true);
          
          if (this.props.onShippingOptionSelect) {
            this.props.onShippingOptionSelect(selectedOption);
          }
        });
      });
    }
  };

  render() {
    const { isCalculating, shippingOptions, selectedOption, error, isFormReadOnly } = this.state;

    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Shipping Information
        </Typography>
        <Box sx={{ mb: 3 }}>
          <ShippingForm 
            ref={this.formRef}
            onChange={() => {}}
            onValidityChange={this.handleFormValidityChange}
            readOnly={isFormReadOnly}
          />
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            onClick={isFormReadOnly ? this.handleEditShipping : this.handleCalculateShipping}
            disabled={!this.state.isFormValid && !isFormReadOnly || isCalculating}
          >
            {isCalculating 
              ? 'Calculating...' 
              : isFormReadOnly 
                ? 'Edit Shipping Information' 
                : 'Calculate Shipping'}
          </Button>

          {isCalculating && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {shippingOptions.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>Available Shipping Options</FormLabel>
              <RadioGroup
                value={selectedOption || ''}
                onChange={this.handleOptionSelect}
              >
                {shippingOptions.map((option) => (
                  <Box 
                    key={option.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      backgroundColor: selectedOption === option.id ? '#f5f5f5' : 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <FormControlLabel
                      value={option.id}
                      control={<Radio />}
                      label={
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{option.companyName}</Typography>
                            <Typography variant="h6" color={option.isFree ? 'success.main' : 'text.primary'}>
                              {option.isFree ? 'FREE' : `$${option.price.toFixed(2)}`}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {option.description}
                          </Typography>
                          {option.hasSurcharge && option.surchargeAmount && (
                            <Typography variant="caption" color="warning.main">
                              +${option.surchargeAmount.toFixed(2)} additional fees may apply
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </Paper>
    );
  }
}

// Use forwardRef to properly expose the ref
export default React.forwardRef<ShippingViewRef, ShippingViewProps>((props, ref) => {
  const viewRef = React.useRef<ShippingViewComponent>(null);
  
  // Expose the getFormData method through the ref
  React.useImperativeHandle(ref, () => ({
    getFormData: () => viewRef.current?.getFormData() || null
  }));

  return <ShippingViewComponent ref={viewRef} {...props} />;
});