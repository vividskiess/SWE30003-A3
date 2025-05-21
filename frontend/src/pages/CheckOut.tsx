import { sharedCart, sharedCatalogue } from '../models';

const CheckOut: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>CheckOut</h1>
      {sharedCart.renderCart(sharedCatalogue)}
    </div>
  );
};

export default CheckOut;

