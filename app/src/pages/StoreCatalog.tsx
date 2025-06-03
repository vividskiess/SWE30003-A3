import React from 'react';
import { Typography, Box } from '@mui/material';
import { sharedCatalogue, sharedCustomer, sharedStaff, sharedCart } from '../models';
import '../styles/Button.css';

interface StoreCatalogState {
  products: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    available: boolean;
    qty: number;
  }>;
}

class StoreCatalog extends React.Component<{}, StoreCatalogState> {
  private unsubscribe: (() => void) | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      products: sharedCatalogue.getProducts()
    };
  }

  componentDidMount() {
    // Subscribe to catalogue changes
    sharedCatalogue.setUpdateCallback(() => {
      this.setState({ products: sharedCatalogue.getProducts() });
    });
  }

  componentWillUnmount() {
    // Clean up subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }


  private handleAddToCart = (product: StoreCatalogState['products'][0]) => {
    console.log(sharedCustomer.getEmail(), sharedStaff.getEmail());
    if (product.available && product.qty > 0) {
      // Update local quantity
      const updatedProducts = this.state.products.map(p => 
        p.id === product.id ? { ...p, qty: p.qty - 1 } : p
      );
      
      // Update cart
      sharedCart.addProduct(product.id);
      console.log('Cart updated:', sharedCart.getItems().map(([id, qty]) => {
        const prod = updatedProducts.find(p => p.id === id);
        return `${prod?.name} (${qty}x)`;
      }));
      
      // Update state
      this.setState({ products: updatedProducts });
    }
  };

  render() {
    const { products } = this.state;

    return (
      <Box className="store-catalog" sx={{ maxWidth: '800px', mx: 'auto', py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            borderBottom: '2px solid #eee',
            pb: 2,
            mb: 4
          }}
        >
          Store Catalog
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {products.map(product => (
            <Box 
              key={product.id} 
              sx={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                p: 3,
                bgcolor: product.available ? 'background.paper' : 'grey.50',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography variant="h6" component="h3" sx={{ m: 0 }}>
                {product.name}
              </Typography>
              <Typography sx={{ m: 0, fontWeight: 'bold', color: 'text.primary' }}>
                ${product.price.toFixed(2)}
                {!product.available && (
                  <Typography component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                    (Out of Stock)
                  </Typography>
                )}
              </Typography>
              {product.description && (
                <Typography variant="body2" color="text.secondary" sx={{ m: 0 }}>
                  {product.description}
                </Typography>
              )}
              <button
                className={`add-to-cart-button ${!product.available ? 'disabled' : ''}`}
                onClick={() => this.handleAddToCart(product)}
                disabled={!product.available || product.qty === 0}
              >
                {product.available && product.qty > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
}

export default StoreCatalog;
