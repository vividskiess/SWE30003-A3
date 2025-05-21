import { sharedCart, sharedCatalogue } from '../models';

const ShoppingCart: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shopping Cart</h1>
      {sharedCart.renderCart(sharedCatalogue)}
    </div>
  );
};

export default ShoppingCart;