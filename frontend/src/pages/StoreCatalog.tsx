import React from 'react';
import { Product, sharedCatalogue } from '../models';
import products from '../data/products.json';

// Initialize the shared catalogue
products.forEach((product: any) => {
  sharedCatalogue.addProduct(new Product(
    product.id,
    product.name,
    product.price,
    product.description,
    product.available
  ));
});

const catalogElement = sharedCatalogue.renderCatalog();

const StoreCatalog: React.FC = () => {
  return (
    <div>{catalogElement}</div>
  );
};

export default StoreCatalog;