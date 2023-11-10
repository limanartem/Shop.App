import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/catalog-service';
import { ProductCategory, ProductItem } from '../../model';
import {
  Select,
  MenuItem,
  InputLabel,
  Box,
  List,
  ListItem,
} from '@mui/material';
import ProductCard from './ProductCard';
import CategoryBreadcrumbs from './CategoryBreadcrumbs';

function Catalog() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const category = params.get('category');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category);

  useEffect(() => {
    console.log('getProducts');
    getProducts(selectedCategory).then((products) => {
      setProducts(products);
    });
  }, [category, selectedCategory]);

  useEffect(() => {
    getCategories().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return (
    <Box>
      <CategoryBreadcrumbs currentCategoryId={selectedCategory} categories={categories} />
      <InputLabel variant="standard" htmlFor="uncontrolled-native">
        Category
      </InputLabel>
      <Select
        value={selectedCategory}
        label="Category"
        onChange={(event) => setSelectedCategory(event.target.value)}
      >
        {categories.map((category) => (
          <MenuItem value={category.id} key={category.id}>
            {category.title}
          </MenuItem>
        ))}
      </Select>
      <List>
        {products.map((row) => (
          <ListItem>
            <ProductCard item={row} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Catalog;
