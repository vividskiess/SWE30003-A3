import React from 'react';
import { Product, StoreCatalogue } from '../models/Product';

const catalog = new StoreCatalogue();
catalog.addProduct(new Product('1', 'Arduino UNO R4 Minima', 19.99, 'A versatile microcontroller board with built-in USB connectivity.'));
catalog.addProduct(new Product('2', 'PIR (Motion) Sensor', 49.99, 'PIR motion sensor for detecting human presence.'));
catalog.addProduct(new Product('3', 'Temperature Sensor', 49.99, 'Temperature sensor for measuring ambient temperature.'));
catalog.addProduct(new Product('4', 'Analog Ambient Light Sensor', 49.99, 'Analog ambient light sensor for measuring light levels.', false));


const StoreCatalogComponent: React.FC = () => {
  const products = catalog.getProducts();

  return (
    <div className="store-catalog" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Store Catalog</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div 
            key={product.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: product.available ? '#fff' : '#f8f8f8'
            }}
          >
            <h3 style={{ marginTop: 0 }}>{product.name}</h3>
            <p style={{ fontWeight: 'bold', color: '#333' }}>
              ${product.price.toFixed(2)}
              {!product.available && 
                <span style={{ 
                  marginLeft: '0.5rem',
                  color: '#999',
                  fontSize: '0.8rem'
                }}>(Out of Stock)</span>
              }
            </p>
            {product.description && 
              <p style={{ color: '#666' }}>{product.description}</p>
            }
            <button 
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: product.available ? '#4CAF50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: product.available ? 'pointer' : 'not-allowed'
              }}
              disabled={!product.available}
            >
              {product.available ? 'Add to Cart' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreCatalogComponent;