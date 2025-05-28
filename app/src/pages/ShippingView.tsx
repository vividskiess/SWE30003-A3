import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { ShippingForm } from '../models/ShippingManager';
import { checkoutManager } from '../models/CheckoutManagerTest';

interface ShippingViewProps {
  onNext?: () => void;
}

export class ShippingView extends React.Component<ShippingViewProps> {
  render() {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Shipping Information
        </Typography>
        <ShippingForm 
          onChange={() => {}}
          onValidityChange={checkoutManager.handleShippingFormValidityChange}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2 }}
          onClick={this.props.onNext}
        >
          Calculate Shipping
        </Button>
      </Paper>
    );
  }
}

export default ShippingView;