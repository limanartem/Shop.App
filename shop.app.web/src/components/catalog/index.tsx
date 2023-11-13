/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { getProducts, getCategories } from '../../services/catalog-service';
import { ProductCategory, ProductItem } from '../../model';
import { Backdrop, Box, CircularProgress, List, ListItem } from '@mui/material';
import ProductCard from './ProductCard';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';
import { useAppSelector } from '../../app/hooks';
import { selectCategory } from '../../app/reducers/searchReducer';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const globalSelectedCategory = useAppSelector(selectCategory);

  useEffect(() => {
    console.log('Catalog:globalSelectedCategory', globalSelectedCategory);
    setProductsLoading(true);
    getProducts(globalSelectedCategory === '-1' ? null : globalSelectedCategory).then(
      (products) => {
        setProducts(products);
        setProductsLoading(false);
      },
    );
  }, [globalSelectedCategory]);

  useEffect(() => {
    getCategories().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return (
    <Box>
      <CategoryBreadcrumbs categories={categories} />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={productsLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>
        {products.map((row) => (
          <ListItem key={row.id}>
            <ProductCard product={row} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Catalog;
