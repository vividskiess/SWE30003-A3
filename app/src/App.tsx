import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Layout from './components/Layout';
import StoreCatalog from './pages/StoreCatalogueView';
import UserProfile from './pages/UserProfile';
import SignUp from './pages/SignUp';
import ShoppingCart from './pages/CartView';
import Login from './pages/LoginView';
// import CheckOut from './pages/CheckOut';
import CheckOutView from './pages/CheckOutView';
// import Authentication from './server/api'; // Temporarily disabled to prevent server interference
// import Dashboard from './Templates/Dashboard';

// Import the font you want to use (e.g., Google Fonts)
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Test from './pages/test';
import OrderView from './pages/OrderView';
import StaffStoreCatalogueView from './pages/StaffStoreCatalogueView';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<StoreCatalog />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/cart" element={<ShoppingCart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<CheckOutView />} />
            <Route path="/order/:id" element={<OrderView />} />
            <Route path="/test" element={<Test />} />
            <Route path="/admin/products" element={<StaffStoreCatalogueView />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
