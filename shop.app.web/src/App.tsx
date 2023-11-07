import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/home';
import Catalog from './components/catalog';

function App() {
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

  return <RouterProvider router={router} />;
}

export default App;
