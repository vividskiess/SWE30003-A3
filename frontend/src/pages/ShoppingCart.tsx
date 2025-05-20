import React from 'react';
import { Product, Cart } from '../models/Product';

const cart = new Cart();

const cartElement = cart.renderCart();

const ShoppingCart: React.FC = () => {
  return (
    <div>{cartElement}</div>
  );
};

export default ShoppingCart;