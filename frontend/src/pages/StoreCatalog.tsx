import React from 'react';
import { Product, StoreCatalogue } from '../models/Product';
import products from '../data/products.json';

const catalog = new StoreCatalogue();
products.forEach((product: any) => {
  catalog.addProduct(new Product(
    product.id,
    product.name,
    product.price,
    product.description,
    product.available
  ));
});

const catalogElement = catalog.renderCatalog();

const StoreCatalogComponent: React.FC = () => {
  return (
    <div>{catalogElement}</div>
  );
};

export default StoreCatalogComponent;