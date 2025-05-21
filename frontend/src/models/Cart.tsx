import { StoreCatalogue } from "./StoreCatalogue";
// import { sharedCart, sharedCatalogue } from '../models';
export class Cart {
  private items: [string, number][] = [];

  // Add a product to cart
  addProduct(productId: string, quantity: number = 1): void {
    const existingItem = this.items.find(([id]) => id === productId);
    if (existingItem) {
      existingItem[1] += quantity;
    } else {
      this.items.push([productId, quantity]);
    }
  }

  // Remove a product from cart
  removeProduct(productId: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(([id]) => id !== productId);
    return this.items.length !== initialLength;
  }

  // Modify product quantity
  modifyQuantity(productId: string, quantity: number): boolean {
    const item = this.items.find(([id]) => id === productId);
    if (item && quantity > 0) {
      item[1] = quantity;
      return true;
    }
    return false;
  }

  // Get total price of all products in cart
  getTotalPrice(catalogue: StoreCatalogue): number {
    return Number(
      this.items
        .reduce((total, [productId, quantity]) => {
          const product = catalogue.getProducts().find(p => p.id === productId);
          return total + (product?.price || 0) * quantity;
        }, 0)
        .toFixed(2)
    );
  }

  // Get all items in cart
  getItems(): [string, number][] {
    return [...this.items];
  }

  // Clear cart
  clear(): void {
    this.items = [];
  }

  renderCart(catalogue: StoreCatalogue): React.ReactElement {
    // Log cart contents and total price
    console.log('Catalogue products:', catalogue.getProducts());
    console.log('Cart items:', this.items);

    console.log(
      'Cart updated:',
      this.items.map(([id, qty]) => {
        const prod = catalogue.getProducts().find(p => p.id === id);
        return `${prod?.name} (${qty}x)`;
      })
    );
    console.log('Total price:', this.getTotalPrice(catalogue));

    return (
      <div className="shopping-cart" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {this.items.map(([productId, quantity]) => {
            const product = catalogue.getProducts().find(p => p.id === productId);
            if (!product) return null;

            return (
              <div key={productId} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0 }}>{product.name}</h3>
                  <p style={{ margin: 0, color: '#777' }}>
                    ${product.price.toFixed(2)} × {quantity}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => this.modifyQuantity(productId, quantity - 1)}
                    disabled={quantity <= 1}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => this.modifyQuantity(productId, quantity + 1)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
          <h3>Total: ${this.getTotalPrice(catalogue).toFixed(2)}</h3>
        </div>
      </div>
    );
  }
}