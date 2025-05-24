import { createTheme } from '@mui/material/styles';

// Create a theme instance with consistent typography
const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    // You can customize other typography variants here
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    // Add more variants as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents uppercase text in buttons
        },
      },
    },
  },
});

export default theme;
