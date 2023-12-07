import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './features/home';
import Catalog from './features/catalog';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import { amber } from '@mui/material/colors';
import AppWrapper from './components/app-wrapper';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import CheckOut from './features/check-out';
import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  DataLoadingState,
  fetchCategories,
  selectCategoriesStatus,
} from './app/reducers/categoriesReducer';
import { useEffect, useState } from 'react';
import Orders from './features/orders';
import { AuthWrapper, CategoryContextProvider, AuthRoutes } from './components';
import { OrderPage } from './features/orders/OrderDetails';

function InitializeDataWrapper({ children }: { children?: React.ReactNode }) {
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (categoriesStatus === DataLoadingState.idle) {
      dispatch(fetchCategories() as any);
    }
  }, [categoriesStatus, dispatch]);

  return <>{children}</>;
}

function App() {
  const [authInitialized, setAuthInitialized] = useState(false);

  const defaultTheme = createTheme({
    palette: {
      primary: {
        main: '#FF5733',
      },
      secondary: amber,
    },
  });

  return (
    <Provider store={store}>
      <InitializeDataWrapper>
        <AuthWrapper
          onAuthInitialized={() => {
            setAuthInitialized(true);
          }}
        >
          <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <BrowserRouter>
              <CategoryContextProvider>
                <AppWrapper>
                  <Box padding={1}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route
                        path="/checkout"
                        element={
                          <SessionAuth>
                            <CheckOut />
                          </SessionAuth>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <SessionAuth>
                            <Orders />
                          </SessionAuth>
                        }
                      />
                      <Route
                        path="/orders/:id"
                        element={
                          <SessionAuth>
                            <OrderPage />
                          </SessionAuth>
                        }
                      />
                      {authInitialized && AuthRoutes()}
                    </Routes>
                  </Box>
                </AppWrapper>
              </CategoryContextProvider>
            </BrowserRouter>
          </ThemeProvider>
        </AuthWrapper>
      </InitializeDataWrapper>
    </Provider>
  );
}

export default App;
