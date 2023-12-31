import { useEffect, useState } from 'react';
import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  List,
  ListItem,
} from '@mui/material';
import ProductCard from './ProductCard';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';
import { useAppSelector } from '../../app/hooks';
import { selectCategory } from '../../app/reducers/searchReducer';
import { selectCategories } from '../../app/reducers/categoriesReducer';
import { ProductPlaceholder } from './ProductPlaceholder';
import { catalogServiceClient } from '../../services';
import { ProductItem } from '@shop.app/lib.client-data/dist/model';

function Catalog() {
  const [productsLoading, setProductsLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const categories = useAppSelector(selectCategories);

  const globalSelectedCategory = useAppSelector(selectCategory);

  useEffect(() => {
    console.log('Catalog:fetching products for globalSelectedCategory', globalSelectedCategory);
    setProductsLoading(true);
    catalogServiceClient
      .getProductsAsync({
        category: globalSelectedCategory === '-1' ? null : globalSelectedCategory,
      })
      .then((products) => {
        setProducts(products);
      })
      .finally(() => {
        setProductsLoading(false);
      });
  }, [globalSelectedCategory]);

  return (
    <Card style={{ width: '100%' }} data-testid="feature-catalog">
      <CardHeader title="Products Catalog" />
      <CardContent style={{ paddingTop: 0 }}>
        <Box>
          <CategoryBreadcrumbs categories={categories} currentTotal={products.length} />
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={productsLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <List data-testid="list-products">
            {productsLoading === false
              ? products.map((row) => (
                  <ListItem key={row.id} data-testid={`product-${row.id}`}>
                    <ProductCard product={row} />
                  </ListItem>
                ))
              : [...Array(3).keys()].map((i) => (
                  <ListItem key={i}>
                    <ProductPlaceholder />
                  </ListItem>
                ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Catalog;
