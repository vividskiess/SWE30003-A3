import { Box, Container, Toolbar  } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { ReactNode } from 'react';
import '../styles/global.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Toolbar /> {/* Add this spacer to push content below the fixed navbar */}
      <Container component="main" sx={{ flex: 1, p: 0 }} maxWidth={false} disableGutters>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;