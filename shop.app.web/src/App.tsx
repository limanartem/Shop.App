/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import Catalog from './components/catalog';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Toolbar } from '@mui/material';
import { amber } from '@mui/material/colors';
import AppWrapper from './components/app-wrapper';
import { Dispatch, SetStateAction, createContext } from 'react';
import AppNavigation from './AppNavigation';

export const GlobalSelectedCategoryContext = createContext({
  globalSelectedCategory: null,
  setGlobalSelectedCategory: (_: string) => {},
} as { globalSelectedCategory: string | null; setGlobalSelectedCategory: Dispatch<SetStateAction<string | null>> });

function App() {
  const defaultTheme = createTheme({
    palette: {
      primary: {
        main: '#FF5733',
      },
      secondary: amber,
    },
  });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppNavigation>
          <AppWrapper>
            <Toolbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
            </Routes>
          </AppWrapper>
        </AppNavigation>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
