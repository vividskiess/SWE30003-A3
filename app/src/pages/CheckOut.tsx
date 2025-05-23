import { Typography, Container } from '@mui/material';
import { sharedCheckoutManager } from '../models/CheckoutManager';

const CheckoutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>
      {sharedCheckoutManager.renderCheckoutItems()}
    </Container>
  );
};

export default CheckoutPage;