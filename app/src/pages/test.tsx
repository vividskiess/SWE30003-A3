import React, { useEffect } from 'react';
import { Typography, Container, Box } from '@mui/material';
import { sharedCatalogue } from '../models';
import { Authentication, StoreManagement } from '../server/api';

/**
 * StoreCatalog component displays all available products from the store catalogue
 * Initialization is now handled in main.tsx
 */
const Test: React.FC = () => {
  // Check if catalog has products on component mount
  useEffect(() => {
    if (sharedCatalogue.getProducts().length === 0) {
      console.warn('Store catalog is empty. Ensure initialization happens in main.tsx');
    }
    const user: any = Authentication.getUser(1)
    const allUsers: any = Authentication.getAllUsers()
    const allProducts: any = StoreManagement.getAllProducts()
		// console.log(user)
    // console.log(allUsers)
    console.log(allProducts)
    // Optional: Could add subscription to catalog changes here if needed
  }, []);

  return (
    <Container maxWidth="lg">
      {/* Render the catalog using the shared instance */}
      {sharedCatalogue.getProducts().length > 0 ? (
        <Box>
          {sharedCatalogue.renderCatalog()}
        </Box>
      ) : (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ my: 8 }}>
          Loading products...
        </Typography>
      )}
    </Container>
  );
};

export default Test;
