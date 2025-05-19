export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public description: string = ''
  ) {}
}

export class StoreCatalog {
  private products: Product[] = [];

  addProduct(product: Product): void {
    this.products.push(product);
  }

  getProducts(): Product[] {
    return [...this.products];
  }
}