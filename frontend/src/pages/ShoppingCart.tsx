import { sharedCart, sharedCatalogue } from '../models';
import { useState, useEffect } from 'react';

const ShoppingCart: React.FC = () => {


  return (
    <div>
      {sharedCart.renderCart(sharedCatalogue)}
    </div>
  );
};

export default ShoppingCart;