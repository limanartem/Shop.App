/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { getProductsAsync } from '../../services/catalog-service';
import { ProductItem } from '../../model';
import { Backdrop, Box, CircularProgress, List, ListItem } from '@mui/material';
import ProductCard from './ProductCard';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';
import { useAppSelector } from '../../app/hooks';
import { selectCategory } from '../../app/reducers/searchReducer';
import { selectCategories } from '../../app/reducers/categoriesReducer';

function Catalog({ children }: { children?: React.ReactNode }) {
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const categories = useAppSelector(selectCategories);

  const globalSelectedCategory = useAppSelector(selectCategory);

  useEffect(() => {
    console.log('Catalog:fetching products for globalSelectedCategory', globalSelectedCategory);
    setProductsLoading(true);
    getProductsAsync({
      category: globalSelectedCategory === '-1' ? null : globalSelectedCategory,
    }).then((products) => {
      setProducts(products);
      setProductsLoading(false);
    });
  }, [globalSelectedCategory]);

  return (
    <Box data-testid="feature-catalog">
      <Box>
        <CategoryBreadcrumbs categories={categories} currentTotal={products.length} />
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={productsLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <List data-testid="list-products">
          {products.map((row) => (
            <ListItem key={row.id} data-testid={`product-${row.id}`}>
              <ProductCard product={row} />
            </ListItem>
          ))}
        </List>
      </Box>
      {children}
    </Box>
  );
}

export default Catalog;
