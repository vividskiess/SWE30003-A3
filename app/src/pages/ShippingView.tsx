import React from 'react';
import { Paper, Typography, Button, Box, CircularProgress, FormControlLabel, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import { ShippingForm } from '../models/ShippingManager';
import { shippingService } from '../models/ShippingService';
import { checkoutManager } from '../models/CheckoutManagerTest';

type ShippingOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
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

export class ShippingView extends React.Component<ShippingViewProps, ShippingViewState> {
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
      // Simulate API call to get shipping options
      const response = await shippingService.calculateShipping(
        {
          streetAddress: '123 Test St',
          town: 'Testville',
          state: 'VIC',
          postcode: '3000',
          country: 'Australia'
        },
        { 
          weight: 1.5, 
          dimensions: { 
            length: 30, 
            width: 20, 
            height: 10 
          },
          isFragile: false
        },
        1 // item count
      );

      if (response.success && response.methods) {
        const shippingOptions = response.methods.map((m: any) => ({
          id: m.id,
          name: m.name,
          description: `Estimated delivery: ${m.estimatedDelivery}`,
          price: m.price,
          estimatedDays: m.estimatedDays
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
                value={selectedOption}
                onChange={this.handleOptionSelect}
              >
                {shippingOptions.map((option) => (
                  <Box key={option.id} sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    p: 2, 
                    mb: 1,
                    backgroundColor: selectedOption === option.id ? '#f5f5f5' : 'transparent'
                  }}>
                    <FormControlLabel
                      value={option.id}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2">{option.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.description} • ${option.price.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0 }}
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

export default ShippingView;