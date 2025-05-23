import React, { useState, useEffect } from 'react';
import { StoreCatalogue } from "./StoreCatalogue";
import { Button, Typography, Box, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

export class Cart {
  private items: [string, number][] = []; // Array of [productId, quantity] tuples
  private listeners: (() => void)[] = []; // For notifying UI components when cart changes

  // Subscribe to cart changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of cart changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Add a product to cart - ENSURE ID IS STRING
  addProduct(productId: string | number, quantity: number = 1): void {
    // Convert ID to string to ensure consistent type
    const idString = String(productId);
    
    const existingItem = this.items.find(([id]) => id === idString);
    if (existingItem) {
      existingItem[1] += quantity;
    } else {
      this.items.push([idString, quantity]);
    }
    this.notifyListeners();
    console.log('Product added to cart:', idString, 'Quantity:', existingItem ? existingItem[1] : quantity);
  }

  // Remove a product from cart
  removeProduct(productId: string | number): boolean {
    // Convert ID to string for consistent comparison
    const idString = String(productId);
    
    const initialLength = this.items.length;
    this.items = this.items.filter(([id]) => id !== idString);
    const changed = this.items.length !== initialLength;
    
    if (changed) {
      this.notifyListeners();
      console.log('Product removed from cart:', idString);
    }
    
    return changed;
  }

  // Modify product quantity
  modifyQuantity(productId: string | number, quantity: number): boolean {
    // Convert ID to string for consistent comparison
    const idString = String(productId);
    
    const item = this.items.find(([id]) => id === idString);
    
    if (item) {
      if (quantity <= 0) {
        // If quantity is zero or negative, remove the item
        return this.removeProduct(idString);
      } else {
        item[1] = quantity;
        this.notifyListeners();
        console.log('Product quantity modified:', idString, 'New quantity:', quantity);
        return true;
      }
    }
    
    return false;
  }

  // Get total price of all products in cart
  getTotalPrice(catalogue: StoreCatalogue): number {
    return Number(
      this.items
        .reduce((total, [productId, quantity]) => {
          // Important: Convert ID to string for comparison
          const product = catalogue.getProducts().find(p => String(p.id) === productId);
          if (!product) {
            console.warn(`Product not found in catalogue: ${productId}`);
            return total;
          }
          return total + (product.price || 0) * quantity;
        }, 0)
        .toFixed(2)
    );
  }

  // Get number of items in cart (total quantity)
  getItemCount(): number {
    return this.items.reduce((count, [_, quantity]) => count + quantity, 0);
  }

  // Get all items in cart
  getItems(): [string, number][] {
    return [...this.items];
  }

  // Clear cart
  clear(): void {
    this.items = [];
    this.notifyListeners();
    console.log('Cart cleared');
  }

  // Render cart as a React component
  renderCart(catalogue: StoreCatalogue): React.ReactElement {
    // Add debug information to help identify issues
    console.log('Cart items:', this.items);
    console.log('Catalogue products:', catalogue.getProducts());
    
    const CartContents = () => {
      // State to trigger re-renders on cart changes
      const [_, setUpdateCounter] = useState(0);
      
      // Subscribe to cart changes
      useEffect(() => {
        const unsubscribe = this.subscribe(() => {
          console.log('Cart updated, refreshing UI');
          setUpdateCounter(prev => prev + 1);
        });
        
        // Cleanup subscription on component unmount
        return unsubscribe;
      }, []);

      // If cart is empty, show message
      if (this.items.length === 0) {
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              component={Link} 
              to="/"
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Box>
        );
      }

      return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
          {this.items.map(([productId, quantity]) => {
            // Use String comparison for product lookup
            const product = catalogue.getProducts().find(p => String(p.id) === productId);
            
            // Debug problematic products
            if (!product) {
              console.error(`Product not found in catalogue: ${productId}`, 
                'Available IDs:', catalogue.getProducts().map(p => p.id));
              return (
                <Paper key={productId} elevation={2} sx={{ mb: 2, p: 2 }}>
                  <Typography color="error">
                    Product ID {productId} not found in catalogue
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => this.removeProduct(productId)}
                    sx={{ mt: 1 }}
                  >
                    Remove Invalid Item
                  </Button>
                </Paper>
              );
            }

            return (
              <Paper 
                key={productId} 
                elevation={2} 
                sx={{ 
                  mb: 2, 
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant="h6" component="h3">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${product.price.toFixed(2)} × {quantity} = ${(product.price * quantity).toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Quantity controls */}
                  <IconButton 
                    size="small"
                    onClick={() => this.modifyQuantity(productId, quantity - 1)}
                    disabled={quantity <= 1}
                    color="primary"
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <Typography sx={{ mx: 1, minWidth: '30px', textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  
                  <IconButton 
                    size="small"
                    onClick={() => this.modifyQuantity(productId, quantity + 1)}
                    color="primary"
                  >
                    <AddIcon />
                  </IconButton>
                  
                  {/* Remove button */}
                  <IconButton 
                    size="small"
                    onClick={() => this.removeProduct(productId)}
                    color="error"
                    sx={{ ml: 1 }}
                    aria-label="remove item"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            );
          })}
          
          {/* Cart summary */}
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Subtotal ({this.getItemCount()} items):</Typography>
              <Typography variant="body1" fontWeight="bold">
                ${this.getTotalPrice(catalogue).toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => this.clear()}
              >
                Clear Cart
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                component={Link} 
                to="/checkout"
                sx={{ fontSize: '14px', fontWeight: 'bold' }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    };

    return <CartContents />;
  }
}
