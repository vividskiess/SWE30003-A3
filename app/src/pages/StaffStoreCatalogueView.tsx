import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { sharedCatalogue, Product } from '../models';

/**
 * StaffStoreCatalogueView component for staff to manage products
 * Allows adding, editing, and removing products from the catalog
 */
const StaffStoreCatalogueView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  // State to track if we're editing an existing product (not directly used but needed for state management)
  const [, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    available: true
  });

  // Load products on component mount
  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(sharedCatalogue.getProducts());
  };

  const handleOpenAddDialog = () => {
    setFormData({
      id: generateProductId(),
      name: '',
      price: '',
      description: '',
      available: true
    });
    setIsNewProduct(true);
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      available: product.available
    });
    setIsNewProduct(false);
    setEditingProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveProduct = () => {
    try {
      // Validate form data
      if (!formData.name.trim()) {
        showSnackbar('Product name is required', 'error');
        return;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        showSnackbar('Please enter a valid price', 'error');
        return;
      }

      if (isNewProduct) {
        // Add new product
        const newProduct = new Product(
          formData.id,
          formData.name,
          price,
          formData.description,
          formData.available
        );
        sharedCatalogue.addProduct(newProduct);
        showSnackbar('Product added successfully', 'success');
      } else {
        // Update existing product
        const updated = sharedCatalogue.modifyProduct(formData.id, {
          name: formData.name,
          price: price,
          description: formData.description,
          available: formData.available
        });

        if (updated) {
          showSnackbar('Product updated successfully', 'success');
        } else {
          showSnackbar('Failed to update product', 'error');
        }
      }

      refreshProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar('An error occurred while saving the product', 'error');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const removed = sharedCatalogue.removeProduct(productId);
      if (removed) {
        showSnackbar('Product removed successfully', 'success');
        refreshProducts();
      } else {
        showSnackbar('Failed to remove product', 'error');
      }
    }
  };

  const generateProductId = () => {
    return `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Staff Product Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add New Product
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Product Catalog - {products.length} items
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="product table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, opacity: product.available ? 1 : 0.7 }}
                >
                  <TableCell component="th" scope="row">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="primary" sx={{ fontWeight: 'medium' }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.description || 'No description available'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.available ? 'In Stock' : 'Out of Stock'} 
                      color={product.available ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenEditDialog(product)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteProduct(product.id)}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No products available. Add your first product using the button above.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isNewProduct ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Product ID"
              name="id"
              value={formData.id}
              disabled
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              size="small"
            />
            <TextField
              label="Price ($)"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              size="small"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              size="small"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.available}
                  onChange={handleInputChange}
                  name="available"
                  color="primary"
                />
              }
              label="Available in Stock"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            {isNewProduct ? 'Add Product' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StaffStoreCatalogueView;
