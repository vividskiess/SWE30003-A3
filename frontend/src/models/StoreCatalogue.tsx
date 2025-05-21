import { Product } from './Product';
// import { Cart } from './Cart';
import { sharedCart } from '.';

export class StoreCatalogue {
  private products: Product[] = [];
  addProduct(product: Product): void {
    this.products.push(product);
  }

  getProducts(): Product[] {
    return [...this.products];
  }

  // Update product details
  // Frontend: catalogue.modifyProduct("product-id", { price: 19.99, description: "New description" });
  modifyProduct(productId: string, updates: Partial<Product>): boolean {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      Object.assign(product, updates);
      return true;
    }
    return false;
  }

  // Remove a product
  // Frontend: catalogue.removeProduct("product-id");
  removeProduct(productId: string): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== productId);
    return this.products.length !== initialLength;
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
              padding: '1.5rem',
              backgroundColor: product.available ? '#fff' : '#f8f8f8',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h3 style={{ margin: 0 }}>{product.name}</h3>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
                ${product.price.toFixed(2)}
                {!product.available && 
                  <span style={{ marginLeft: '0.5rem', color: '#999', fontSize: '0.8rem' }}>(Out of Stock)</span>
                }
              </p>
              {product.description && 
                <p style={{ margin: 0, color: '#666' }}>{product.description}</p>
              }
              <button 
                onClick={() => {
                  sharedCart.addProduct(product.id);
                  console.log('Cart updated:', sharedCart.getItems().map(([id, qty]) => {
                    const prod = this.products.find(p => p.id === id);
                    return `${prod?.name} (${qty}x)`;
                  }));
                  console.log('Total price:', sharedCart.getTotalPrice(this));
                }}
                disabled={!product.available}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: product.available ? '#4CAF50' : '#cccccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: product.available ? 'pointer' : 'not-allowed',
                  marginTop: 'auto'
                }}
              >
                {product.available ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}