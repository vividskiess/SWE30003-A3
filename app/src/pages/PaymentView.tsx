import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PaymentForm } from '../models/PaymentProcessor';
import { checkoutManager } from '../models/CheckoutManagerTest';

interface PaymentViewProps {
  // No buttons needed for now
}

export class PaymentView extends React.Component<PaymentViewProps> {
  render() {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        <PaymentForm 
          onChange={() => {}}
          onValidityChange={checkoutManager.handlePaymentFormValidityChange}
        />
      </Paper>
    );
  }
}

export default PaymentView;