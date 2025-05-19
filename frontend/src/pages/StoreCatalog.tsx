import React from 'react';
import { Product, StoreCatalog } from '../models/Product';

const catalog = new StoreCatalog();
catalog.addProduct(new Product('1', 'Arduino UNO R4 Minima', 19.99));
catalog.addProduct(new Product('2', 'PIR (Motion) Sensor', 49.99));
catalog.addProduct(new Product('3', 'Temperature Sensor', 49.99));
catalog.addProduct(new Product('3', 'Analog Ambient Light Sensor', 49.99));


const StoreCatalogComponent: React.FC = () => {
  const products = catalog.getProducts();

  return (
    <div className="store-catalog">
      <h1>Store Catalog</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price.toFixed(2)}</p>
            {product.description && <p>{product.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoreCatalogComponent;