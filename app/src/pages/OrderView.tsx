import React from 'react';
import { Container, Typography, Paper, Box, Button, Divider, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { sharedOrder } from '../models/index';

interface OrderViewProps {}

interface OrderViewState {
  orderDetails: any;
  isLoading: boolean;
  error: string | null;
}

class OrderView extends React.Component<OrderViewProps, OrderViewState> {
  
  constructor(props: OrderViewProps) {
    super(props);
    this.state = {
      orderDetails: null,
      isLoading: true,
      error: null
    };
  }

  componentDidMount() {
    this.loadOrderDetails();
  }

  private loadOrderDetails = () => {
    try {
      // Get the order ID from the URL path
      const pathParts = window.location.pathname.split('/');
      const orderId = pathParts[pathParts.length - 1];
      
      if (!orderId) {
        this.setState({ 
          error: 'No order ID provided',
          isLoading: false 
        });
        return;
      }
      
      // In a real app, you would fetch the order details from an API using the ID
      // For now, we'll use the sharedOrder instance
      const orderDetails = sharedOrder.getOrderSummary();
      
      if (!orderDetails) {
        this.setState({ 
          error: 'Order not found',
          isLoading: false 
        });
        return;
      }
      
      this.setState({ 
        orderDetails,
        isLoading: false,
        error: null 
      });
      
    } catch (error) {
      console.error('Error loading order details:', error);
      this.setState({ 
        error: 'Failed to load order details',
        isLoading: false 
      });
    }
  }

  private formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  render() {
    const { orderDetails, isLoading, error } = this.state;
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      );
    }

    if (error || !orderDetails) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h5" gutterBottom>Order Not Found</Typography>
          <Typography>{error || 'We couldn\'t find the order you\'re looking for.'}</Typography>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Container>
      );
    }

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Order Confirmation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your order!
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Order #{orderDetails.orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {this.formatDate(orderDetails.orderDate)}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
            {orderDetails.shippingInfo && (
              <Box>
                {/* Add shipping brand name if available */}
                {orderDetails.shippingOption && (
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography sx={{ fontWeight: 'medium', width: '120px' }}>Shipping Method:</Typography>
                    <Typography>
                      {orderDetails.shippingOption.companyName} - {orderDetails.shippingOption.name}
                      {orderDetails.shippingOption.estimatedDays && ` (${orderDetails.shippingOption.estimatedDays})`}
                    </Typography>
                  </Box>
                )}
                
                {/* Address with labels */}
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'medium', width: '120px' }}>Address:</Typography>
                  <Typography>{orderDetails.shippingInfo.streetAddress}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'medium', width: '120px' }}>Suburb:</Typography>
                  <Typography>{orderDetails.shippingInfo.town}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'medium', width: '120px' }}>State/Postcode:</Typography>
                  <Typography>{orderDetails.shippingInfo.state} {orderDetails.shippingInfo.postcode}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'medium', width: '120px' }}>Country:</Typography>
                  <Typography>{orderDetails.shippingInfo.country}</Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>Payment Method</Typography>
            {orderDetails.paymentInfo && (
              <Box>
                <Typography>Credit Card ending in {orderDetails.paymentInfo.cardNumber.split(' ').pop()}</Typography>
                <Typography>Expires: {orderDetails.paymentInfo.expiryDate}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        <List>
          {orderDetails.items.map((item: any, index: number) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={item.name}
                  secondary={`Quantity: ${item.quantity}`}
                />
                <Typography variant="body1">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </Typography>
              </ListItem>
              {index < orderDetails.items.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Typography variant="body1" gutterBottom>
            Subtotal: ${orderDetails.subtotal.toFixed(2)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Shipping: ${orderDetails.shippingCost ? orderDetails.shippingCost.toFixed(2) : (orderDetails.total - orderDetails.subtotal).toFixed(2)}
          </Typography>
          {orderDetails.shippingOption && (
            <Box sx={{ mb: 2, textAlign: 'right' }}>
              <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.875rem' }}>
                {orderDetails.shippingOption.companyName} - {orderDetails.shippingOption.name}
                {orderDetails.shippingOption.estimatedDays && ` (${orderDetails.shippingOption.estimatedDays})`}
              </span>
            </Box>
          )}
          <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
            Total: ${orderDetails.total.toFixed(2)}
          </Typography>
        </Box>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            Back to Home
          </Button>
      </Paper>
    </Container>
    );
  }
}

export default OrderView;