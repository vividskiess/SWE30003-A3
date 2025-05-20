import React from 'react';
import { Product, Cart } from '../models';

const cart = new Cart();

const cartElement = cart.renderCart();

const ShoppingCart: React.FC = () => {
  return (
    <div>{cartElement}</div>
  );
};

export default ShoppingCart;