import { Cart } from './Cart';
import { StoreCatalogue } from "./StoreCatalogue";

export * from './Cart';
export * from './Product';
export * from './StoreCatalogue';

export const sharedCart = new Cart();
export const sharedCatalogue = new StoreCatalogue();