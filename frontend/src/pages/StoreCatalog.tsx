import React from 'react';
import { Product, StoreCatalogue } from '../models/Product';

const catalog = new StoreCatalogue();
catalog.addProduct(new Product('1', 'Arduino UNO R4 Minima', 19.99, 'A versatile microcontroller board with built-in USB connectivity.'));
catalog.addProduct(new Product('2', 'PIR (Motion) Sensor', 49.99, 'PIR motion sensor for detecting human presence.'));
catalog.addProduct(new Product('3', 'Temperature Sensor', 49.99, 'Temperature sensor for measuring ambient temperature.'));
catalog.addProduct(new Product('4', 'Analog Ambient Light Sensor', 49.99, 'Analog ambient light sensor for measuring light levels.', false));

const catalogElement = catalog.renderCatalog();

const StoreCatalogComponent: React.FC = () => {

  return (
    <div>{catalogElement}</div>
  );
};

export default StoreCatalogComponent;