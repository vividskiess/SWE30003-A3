import React from 'react';
import { Paper, Typography } from '@mui/material';
import { PaymentForm } from '../models/PaymentProcessor';
import { checkoutManager } from '../models/CheckoutManagerTest';

interface PaymentViewProps {
  amount: number;
  onPaymentProcessed?: (success: boolean, data?: any) => void;
  onEdit?: () => void;
  readOnly?: boolean;
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
    console.log('PaymentView: Payment processed:', { success, data });
    
    if (success) {
      this.setState({ 
        isPaymentVerified: true,
        isProcessing: false,
        paymentError: null
      });
      checkoutManager.handlePaymentFormValidityChange(true);
      
      // Pass the payment form data back to the parent
      // The data is already the form data, don't try to access data.formData
      if (this.props.onPaymentProcessed) {
        this.props.onPaymentProcessed(success, data);
      }
    } else {
      const errorMessage = data?.error || 'Payment processing failed';
      console.error('PaymentView: Payment failed:', errorMessage);
      
      this.setState({ 
        paymentError: errorMessage,
        isProcessing: false 
      });
      checkoutManager.handlePaymentFormValidityChange(false);
      
      if (this.props.onPaymentProcessed) {
        this.props.onPaymentProcessed(false, { error: errorMessage });
      }
    }
  };


  render() {
    const { amount, onEdit, readOnly } = this.props;
    const { isPaymentVerified } = this.state;
    const isActuallyReadOnly = readOnly || isPaymentVerified;

    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        
        <PaymentForm
          amount={amount}
          onPaymentProcessed={this.handlePaymentProcessed}
          onValidityChange={(isValid) => {
            if (!isPaymentVerified) {
              checkoutManager.handlePaymentFormValidityChange(isValid);
            }
          }}
          readOnly={isActuallyReadOnly}
          onEdit={onEdit}
        />
      </Paper>
    );
  }
}

export default PaymentView;
