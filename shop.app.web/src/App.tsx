import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/home';
import Catalog from './components/catalog';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Toolbar } from '@mui/material';
import { amber } from '@mui/material/colors';
import AppWrapper from './components/app-wrapper';

function App() {
  const defaultTheme = createTheme({
    palette: {
      primary: {
        main: '#FF5733',
      },
      secondary: amber,
    },
  });

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/catalog',
      element: <Catalog />,
    },
  ]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppWrapper>
        <Toolbar />
        <RouterProvider router={router} />
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
