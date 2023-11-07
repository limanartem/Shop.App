import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/catalog-service';
import { ProductCategory, ProductItem } from '../../model';
import {
  Button,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography
} from '@mui/material';

function Catalog() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const category = params.get('category');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category);

  useEffect(() => {
    console.log('getProducts');
    getProducts(category).then((products) => {
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
      <Typography variant="h2" gutterBottom>
      Products Page
      </Typography>
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={row.title} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.title}
                </TableCell>
                <TableCell>
                  <div dangerouslySetInnerHTML={{ __html: row.description }}></div>
                </TableCell>
                <TableCell>{row.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Catalog;
