import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Layout from './components/Layout';
import StoreCatalog from './pages/StoreCatalog';
import UserProfile from './pages/UserProfile';
import SignUp from './pages/SignUp';
import ShoppingCart from './pages/ShoppingCart';
import Login from './pages/Login';
import CheckOut from './pages/CheckOut';
import Authentication from './server/api';
import Dashboard from './Templates/Dashboard';

// Import the font you want to use (e.g., Google Fonts)
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
      
        <Routes>
          <Route path="/" element={<StoreCatalog />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/dashboard" element = {<Dashboard />} />
        </Routes>
      
      </Layout>
    </BrowserRouter>
  );
}

export default App;
