import { Cart } from './Cart';
import { Product } from './Product';
import { StoreCatalogue } from './StoreCatalogue';
import products from '../data/products.json';

export * from './Cart';
export * from './Product';
export * from './StoreCatalogue';

export const sharedCatalogue = new StoreCatalogue();
export const sharedCart = new Cart();

// Initialize catalog with products
(function initializeStore() {
  if (sharedCatalogue.getProducts().length === 0) {
    console.log('Initializing store catalogue with products');
    products.forEach((product: any) => {
      sharedCatalogue.addProduct(new Product(
        product.id,
        product.name,
        product.price,
        product.description,
        product.available
      ));
    });
  }
})();
