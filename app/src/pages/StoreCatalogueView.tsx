import React from 'react';
import { Typography, Box, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { sharedCatalogue, sharedCustomer, sharedStaff, sharedCart } from '../models';
import { StoreManagement } from '../server/api';
import '../styles/Button.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

interface StoreCatalogState {
  products: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    available: boolean;
    qty: number;
  }>;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  currentProduct: {
    id: string;
    name: string;
    price: string;
    description: string;
    qty: string;
    available: boolean;
  };
  errors: {
    name?: string;
    price?: string;
    qty?: string;
    description?: string;
  };
}

class StoreCatalog extends React.Component<{}, StoreCatalogState> {
  private unsubscribe: (() => void) | null = null;
  private inputTimeout: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      products: sharedCatalogue.getProducts(),
      isAddDialogOpen: false,
      isEditDialogOpen: false,
      currentProduct: {
        id: '',
        name: '',
        price: '',
        description: '',
        qty: '0',
        available: true
      },
      errors: {}
    };
    // Log initial catalog state
    console.log('Initial catalog state:', sharedCatalogue.getProducts());
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


  private isStaffUser(): boolean {
    return !!sharedStaff.getEmail();
  }

  private validateProduct = (): boolean => {
    const { name, price, qty, description } = this.state.currentProduct;
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = 'Please enter a valid price';
    }

    if (!qty || isNaN(Number(qty)) || !Number.isInteger(Number(qty)) || Number(qty) <= 0) {
      errors.qty = 'Please enter a valid quantity (whole number > 0)';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  private logCatalogState = (action: string, productData: any) => {
    console.group(`Catalog ${action}`);
    console.log('Action:', action);
    console.log('Product Data:', productData);
    console.log('Current Catalog State:', sharedCatalogue.getProducts());
    console.groupEnd();
  };


  private handleAddToCart = (product: StoreCatalogState['products'][0]) => {
    console.log(sharedCustomer.getEmail(), sharedStaff.getEmail());
    
    if (!product.available) {
      alert('This product is not available for purchase.');
      return;
    }
    
    if (product.qty <= 0) {
      alert('Sorry, this product is out of stock.');
      return;
    }
    
    // Get current quantity in cart
    const currentCartItems = sharedCart.getItems();
    const cartItem = currentCartItems.find(([id]) => id === product.id);
    const currentInCart = cartItem ? cartItem[1] : 0;
    
    // Check if adding would exceed available quantity
    if (currentInCart >= product.qty) {
      return;
    }
    
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
  };

  private handleDeleteProduct = (productId: string) => {
    try {
      const product = this.state.products.find(p => p.id === productId);
      if (product) {
        sharedCatalogue.removeProduct(productId);
        this.logCatalogState('Product Deleted', product);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  private handleOpenAddDialog = () => {
    // Disable body scroll when dialog is open
    document.body.style.overflow = 'hidden';
    this.setState({
      isAddDialogOpen: true,
      currentProduct: {
        id: '',
        name: '',
        price: '',
        description: '',
        qty: '1',
        available: true
      },
      errors: {}
    });
  };

  private handleOpenEditDialog = (product: any) => {
    // Disable body scroll when dialog is open
    document.body.style.overflow = 'hidden';
    
    // Use requestAnimationFrame to ensure state is updated before focusing
    requestAnimationFrame(() => {
      this.setState({
        isEditDialogOpen: true,
        currentProduct: {
          id: product.id,
          name: product.name,
          price: product.price.toString(),
          description: product.description || '',
          qty: product.qty.toString(),
          available: product.available
        },
        errors: {}
      }, () => {
        // Focus the first interactive element in the dialog
        const firstFocusable = document.querySelector('[role="dialog"] button, [role="dialog"] [tabindex="0"]') as HTMLElement;
        firstFocusable?.focus();
      });
    });
  };

  private handleCloseDialogs = (_event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => {
    // Don't close on backdrop click if there are validation errors
    if (reason === 'backdropClick' && Object.keys(this.state.errors).length > 0) {
      return;
    }
    
    // Re-enable body scroll when dialog is closed
    document.body.style.overflow = 'unset';
    this.setState({ 
      isAddDialogOpen: false, 
      isEditDialogOpen: false,
      errors: {} // Clear errors when closing dialog
    });
  };

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Clear any pending updates
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }

    // Debounce the state update
    this.inputTimeout = setTimeout(() => {
      this.setState(prevState => {
        // Skip update if value hasn't changed
        if (prevState.currentProduct[name as keyof typeof prevState.currentProduct] === newValue) {
          return null;
        }

        return {
          currentProduct: {
            ...prevState.currentProduct,
            [name]: newValue
          },
          errors: {
            ...prevState.errors,
            [name]: ''
          }
        };
      });
    }, 50); // 50ms debounce time
  };

  private handleAddProduct = async () => {
    if (!this.validateProduct()) return;
    
    try {
      const { name, price, description, available } = this.state.currentProduct;
      
      // Call the API to create the product
      await StoreManagement.createProduct({
        name: name.trim(),
        price: price,
        description: description.trim(),
        available: available.toString()
      });
      
      // Refresh the products list from the server
      const updatedProducts = await StoreManagement.getAllProducts();
      sharedCatalogue.clear(); // Clear existing products
      updatedProducts.forEach((product: any) => {
        sharedCatalogue.addProduct({
          id: String(product.id),
          name: product.name,
          price: parseFloat(product.price),
          description: product.description,
          available: product.available,
          qty: product.qty || 0
        });
      });
      
      this.logCatalogState('Product Added', { name, price, description, available });
      this.handleCloseDialogs();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  private handleUpdateProduct = () => {
    if (!this.validateProduct()) return;
    
    try {
      const { id, name, price, description, qty, available } = this.state.currentProduct;
      const updatedProduct = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        qty: parseInt(qty, 10),
        available
      };
      
      sharedCatalogue.modifyProduct(id, updatedProduct);
      this.logCatalogState('Product Updated', { id, ...updatedProduct });
      this.handleCloseDialogs();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  render() {
    const { products } = this.state;
    const isStaff = this.isStaffUser();

    const renderProductDialog = (isEdit: boolean) => {
      const { isAddDialogOpen, isEditDialogOpen, currentProduct, errors } = this.state;
      const isOpen = isEdit ? isEditDialogOpen : isAddDialogOpen;

      return (
        <Dialog 
          open={isOpen} 
          onClose={this.handleCloseDialogs}
          disableScrollLock={true}
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          maxWidth="sm"
          fullWidth
          disableEnforceFocus
          disableAutoFocus
          // Ensure the dialog is properly labeled and accessible
          aria-modal="true"
          // Use CSS to handle the backdrop
          sx={{
            '& .MuiDialog-container': {
              '& .MuiBackdrop-root': {
                pointerEvents: 'none'
              },
              '&.MuiDialog-container': {
                '& .MuiDialog-paper': {
                  pointerEvents: 'auto'
                }
              }
            }
          }}
        >
          <DialogTitle id="dialog-title" tabIndex={-1}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <div id="dialog-description" style={{ display: 'none' }}>
            {isEdit ? 'Edit existing product details' : 'Add a new product to the catalog'}
          </div>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                name="name"
                label="Product Name"
                value={currentProduct.name}
                onChange={this.handleInputChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
                variant="outlined"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  name="price"
                  label="Price"
                  type="number"
                  value={currentProduct.price}
                  onChange={this.handleInputChange}
                  fullWidth
                  required
                  inputProps={{ 
                    min: '0.01', 
                    step: '0.01',
                    inputMode: 'decimal'
                  }}
                  error={!!errors.price}
                  helperText={errors.price || 'Enter a positive number'}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  name="qty"
                  label="Quantity"
                  type="number"
                  value={currentProduct.qty}
                  onChange={this.handleInputChange}
                  fullWidth
                  required
                  inputProps={{ 
                    min: '1', 
                    step: '1',
                    inputMode: 'numeric'
                  }}
                  error={!!errors.qty}
                  helperText={errors.qty || 'Must be greater than 0'}
                  margin="normal"
                  variant="outlined"
                />
              </Box>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={3}
                value={currentProduct.description}
                onChange={this.handleInputChange}
                fullWidth
                required
                error={!!errors.description}
                helperText={errors.description}
                margin="normal"
                variant="outlined"
              />
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mt: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1
                }}
              >
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={currentProduct.available}
                  onChange={this.handleInputChange}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '8px',
                    cursor: 'pointer'
                  }}
                />
                <label 
                  htmlFor="available" 
                  style={{ 
                    marginLeft: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Product is available for purchase
                </label>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={this.handleCloseDialogs}
              color="inherit"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={isEdit ? this.handleUpdateProduct : this.handleAddProduct}
              variant="contained"
              color="primary"
              disableElevation
              sx={{ minWidth: '100px' }}
            >
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      );
    };

    return (
      <Box className="store-catalog" sx={{ maxWidth: '1200px', mx: 'auto', py: 4, px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              borderBottom: '2px solid #eee',
              pb: 2,
            }}
          >
            {isStaff ? 'Manage Products' : 'Store Catalog'}
          </Typography>
          {isStaff && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={this.handleOpenAddDialog}
            >
              Add Product
            </Button>
          )}
        </Box>
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
              {isStaff ? (
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.handleOpenEditDialog(product);
                    }}
                    aria-label={`Edit ${product.name}`}
                    // Prevent focus from being trapped
                    onFocus={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => this.handleDeleteProduct(product.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <button
                  className={`add-to-cart-button ${!product.available ? 'disabled' : ''}`}
                  onClick={() => this.handleAddToCart(product)}
                  disabled={!product.available || product.qty === 0 || 
                    (sharedCart.getItems().find(([id]) => id === product.id)?.[1] || 0) >= product.qty}
                  style={{ marginTop: 'auto' }}
                >
                  {(() => {
                    const cartQty = sharedCart.getItems().find(([id]) => id === product.id)?.[1] || 0;
                    if (!product.available) return 'Not Available';
                    if (product.qty === 0) return 'Out of Stock';
                    if (cartQty >= product.qty) return 'Max in Cart';
                    return 'Add to Cart';
                  })()}
                </button>
              )}
            </Box>
          ))}
        </Box>
        {renderProductDialog(false)}
        {renderProductDialog(true)}
      </Box>
    );
  }
}

export default StoreCatalog;
