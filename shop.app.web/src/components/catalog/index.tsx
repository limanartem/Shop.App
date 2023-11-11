/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import { getProducts, getCategories } from '../../services/catalog-service';
import { ProductCategory, ProductItem } from '../../model';
import { Box, List, ListItem } from '@mui/material';
import ProductCard from './ProductCard';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';
import { GlobalSelectedCategoryContext } from '../../CategoryContextProvider';

function Catalog() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const { globalSelectedCategory } = useContext(GlobalSelectedCategoryContext);

  useEffect(() => {
    console.log('Catalog:globalSelectedCategory', globalSelectedCategory);
    getProducts(globalSelectedCategory).then((products) => {
      setProducts(products);
    });
  }, [globalSelectedCategory]);

  useEffect(() => {
    getCategories().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return (
    <Box>
      <CategoryBreadcrumbs categories={categories} />
      <List>
        {products.map((row) => (
          <ListItem key={row.id}>
            <ProductCard item={row} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Catalog;
