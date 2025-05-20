export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public description: string = "",
    public available: boolean = true
  ) {}
}

export class StoreCatalogue {
  private products: Product[] = [];

  addProduct(product: Product): void {
    this.products.push(product);
  }

  getProducts(): Product[] {
    return [...this.products];
  }

  renderCatalog(): React.ReactElement {
    return (
      <div className="store-catalog" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Store Catalog</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {this.products.map(product => (
            <div key={product.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: product.available ? '#fff' : '#f8f8f8'
            }}>
              <h3 style={{ marginTop: 0 }}>{product.name}</h3>
              <p style={{ fontWeight: 'bold', color: '#333' }}>
                ${product.price.toFixed(2)}
                {!product.available && 
                  <span style={{ marginLeft: '0.5rem', color: '#999', fontSize: '0.8rem' }}>(Out of Stock)</span>
                }
              </p>
              {product.description && 
                <p style={{ color: '#666' }}>{product.description}</p>
              }
            </div>
          ))}
        </div>
      </div>
    );
  }
}