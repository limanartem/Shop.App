import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import { fetchProducts, updateProduct, createProduct, fetchProductById, deleteProduct } from '../store/slices/productsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import ImageUpload from '../components/ImageUpload';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  categoryId?: number;
  imageUrls?: string[];
}

const CDN_URL = process.env.REACT_APP_CDN_URL || 'http://localhost:3005/public';

const Products = () => {
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const dispatch = useAppDispatch();
  const { products, currentProduct, loading } = useAppSelector((state: RootState) => state.products);
  const { categories } = useAppSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Update editProduct when currentProduct changes
  useEffect(() => {
    if (currentProduct) {
      setEditProduct(currentProduct);
    }
  }, [currentProduct]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'price', headerName: 'Price', width: 130 },
    { field: 'available', headerName: 'Available', width: 130, type: 'boolean' },
    { 
      field: 'categoryId', 
      headerName: 'Category', 
      width: 250, // Wider to accommodate paths
      valueGetter: (params) => {
        const categoryId = params.value;
        
        // Convert both to numbers for comparison to avoid type mismatches
        const category = categories.find(cat => Number(cat.id) === Number(categoryId));
        
        // Use the category path if available, otherwise fall back to the name
        return category ? (category.path || category.name) : 'None';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams<any, any, any>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit product">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row)}
              data-testid={`edit-product-${params.row.id}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete product">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteConfirm(params.row.id)}
              data-testid={`delete-product-${params.row.id}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    if (product.id) {
      // Dispatch the action to fetch the product by ID
      dispatch(fetchProductById(product.id));
    } else {
      setEditProduct(product);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editProduct) {
      if (editProduct.id) {
        await dispatch(updateProduct(editProduct));
      } else {
        await dispatch(createProduct(editProduct));
      }
    }
    handleClose();
  };

  const handleNew = () => {
    setEditProduct({
      name: '',
      description: '',
      price: 0,
      available: true,
      categoryId: categories.length > 0 ? categories[0].id : undefined,
      imageUrls: [],
    });
    setOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete)).unwrap();
        setSnackbar({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to delete product',
          severity: 'error'
        });
      }
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }} data-testid="products-header">
        <Typography variant="h4" data-testid="products-title">Products</Typography>
        <Button variant="contained" onClick={handleNew} data-testid="add-product-button">
          Add New Product
        </Button>
      </Box>
      <DataGrid
        rows={products}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
        data-testid="products-grid"
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} data-testid="delete-confirmation-dialog">
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} data-testid="delete-cancel-button">Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained" data-testid="delete-confirm-button">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success/Error Notification */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={handleClose} data-testid="product-form-dialog">
        <DialogTitle data-testid="product-form-title">
          {editProduct?.id ? 'Edit Product' : 'New Product'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSave} data-testid="product-form">
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              value={editProduct?.name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditProduct(editProduct ? { ...editProduct, name: e.target.value } : null)
              }
              inputProps={{
                'data-testid': 'product-name-input'
              } as React.InputHTMLAttributes<HTMLInputElement>}
            />
            <TextField
              margin="dense"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={editProduct?.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditProduct(editProduct ? { ...editProduct, description: e.target.value } : null)
              }
              inputProps={{
                'data-testid': 'product-description-input'
              } as React.InputHTMLAttributes<HTMLInputElement>}
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={editProduct?.price || 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditProduct(editProduct ? { ...editProduct, price: parseFloat(e.target.value) || 0 } : null)
              }
              inputProps={{
                'data-testid': 'product-price-input'
              } as React.InputHTMLAttributes<HTMLInputElement>}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={editProduct?.categoryId || ''}
                label="Category"
                onChange={(e) =>
                  setEditProduct(editProduct ? { ...editProduct, categoryId: e.target.value as number } : null)
                }
                sx={{ textIndent: 0 }} // Ensure proper text alignment
                inputProps={{
                  'data-testid': 'product-category-select'
                } as React.InputHTMLAttributes<HTMLInputElement>}
              >
                {categories.map((category) => (
                  <MenuItem 
                    key={category.id} 
                    value={category.id}
                    // Indent based on hierarchy level (count the number of '>' characters)
                    sx={{ 
                      pl: category.path ? (category.path.split('>').length - 1) * 2 + 2 : 2,
                      fontWeight: !category.parentCategoryId ? 'bold' : 'normal' // Bold for top-level categories
                    }}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select a product category</FormHelperText>
            </FormControl>
            
            <ImageUpload
              initialImages={editProduct?.imageUrls || []}
              onChange={(images) => setEditProduct(editProduct ? { ...editProduct, imageUrls: images } : null)}
              maxImages={5}
              cdnUrl={CDN_URL}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Available
              </Typography>
              <FormControlLabel
                data-testid="product-available-label"
                control={
                  <Checkbox
                    checked={editProduct?.available || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditProduct(editProduct ? { ...editProduct, available: e.target.checked } : null)
                    }
                    inputProps={{
                      'data-testid': 'product-available-checkbox'
                    } as React.InputHTMLAttributes<HTMLInputElement>}
                  />
                }
                label=""
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} data-testid="product-form-cancel-button">Cancel</Button>
            <Button type="submit" data-testid="product-form-save-button">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Products;
