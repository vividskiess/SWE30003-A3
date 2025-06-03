import { Cart } from './Cart';
import { Product } from './Product';
import { StoreCatalogue } from './StoreCatalogue';
// import products from '../data/products.json';
import { StoreManagement } from '../server/api';

export * from './Cart';
export * from './Product';
export * from './StoreCatalogue';

export const sharedCatalogue = new StoreCatalogue();
export const sharedCart = new Cart();




// Initialize catalog with products
(function initializeStore() {
  if (sharedCatalogue.getProducts().length === 0) {
    console.log('Initializing store catalogue with products');
    
    StoreManagement.getAllProducts()
      .then((products) => { 
        products.forEach((product: any) => {
          sharedCatalogue.addProduct(new Product(
            String(product.id),
            product.name,
            parseFloat(product.price),
            product.description,
            product.available,
            product.qty
          ));
        });
      });
  }
})();
