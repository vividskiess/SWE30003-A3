import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PaymentForm } from '../models/PaymentProcessor';
import { checkoutManager } from '../models/CheckoutManagerTest';

interface PaymentViewProps {
  amount: number;
  onPaymentProcessed?: (success: boolean) => void;
}

interface PaymentViewState {
  isProcessing: boolean;
  paymentError: string | null;
  isPaymentVerified: boolean;
}

export class PaymentView extends React.Component<PaymentViewProps, PaymentViewState> {
  constructor(props: PaymentViewProps) {
    super(props);
    this.state = {
      isProcessing: false,
      paymentError: null,
      isPaymentVerified: false
    };
  }

  componentDidMount() {
    // Initially set the payment form as invalid
    checkoutManager.handlePaymentFormValidityChange(false);
  }

  private handlePaymentProcessed = (success: boolean, data?: any) => {
    if (success) {
      this.setState({ isPaymentVerified: true });
      checkoutManager.handlePaymentFormValidityChange(true);
    } else {
      this.setState({ 
        paymentError: data?.error || 'Payment processing failed',
        isProcessing: false 
      });
      checkoutManager.handlePaymentFormValidityChange(false);
    }

    if (this.props.onPaymentProcessed) {
      this.props.onPaymentProcessed(success);
    }
  };

  render() {
    const { amount } = this.props;
    const { paymentError, isPaymentVerified } = this.state;

    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        
        {paymentError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {paymentError}
          </Typography>
        )}

        <PaymentForm 
          amount={amount}
          onPaymentProcessed={this.handlePaymentProcessed}
          onValidityChange={(isValid) => {
            if (!isValid) {
              checkoutManager.handlePaymentFormValidityChange(false);
            }
          }}
          readOnly={isPaymentVerified}
        />
      </Paper>
    );
  }
}

export default PaymentView;