import { sharedCart, sharedCatalogue } from '../models';
import { useState, useEffect } from 'react';

const ShoppingCart: React.FC = () => {
  const [, setCartUpdate] = useState(0);

  useEffect(() => {
    const updateCart = () => setCartUpdate(prev => prev + 1);
    sharedCart.addListener(updateCart);
    return () => sharedCart.removeListener(updateCart);
  }, []);

  return (
    <div>
      {sharedCart.renderCart(sharedCatalogue)}
    </div>
  );
};

export default ShoppingCart;