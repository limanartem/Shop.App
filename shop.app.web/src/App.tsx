/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import Catalog from './components/catalog';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Toolbar } from '@mui/material';
import { amber } from '@mui/material/colors';
import AppWrapper from './components/app-wrapper';
import CategoryContextProvider from './components/context-providers/CategoryContextProvider';
import { Provider } from 'react-redux';
import { store } from './app/store';

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
    <Provider store={ store } >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <BrowserRouter>
          <CategoryContextProvider>
            <AppWrapper>
              <Toolbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
              </Routes>
            </AppWrapper>
          </CategoryContextProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
