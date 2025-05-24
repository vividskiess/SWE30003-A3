import { Typography, Container } from '@mui/material';
import CheckoutManager from '../models/CheckoutManager';

const CheckoutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>
      <CheckoutManager />
    </Container>
  );
};

export default CheckoutPage;