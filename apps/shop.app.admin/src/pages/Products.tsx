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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import { fetchProducts, updateProduct, createProduct, fetchProductById, deleteProduct } from '../store/slices/productsSlice';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

const Products = () => {
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const dispatch = useAppDispatch();
  const { products, currentProduct, loading, error } = useAppSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
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
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete product">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteConfirm(params.row.id)}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" onClick={handleNew}>
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
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained">
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editProduct?.id ? 'Edit Product' : 'New Product'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSave}>
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
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={editProduct?.price || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditProduct(editProduct ? {
                  ...editProduct,
                  price: parseFloat(e.target.value) || 0,
                } : null)
              }
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Available
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editProduct?.available || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditProduct(editProduct ? { ...editProduct, available: e.target.checked } : null)
                    }
                  />
                }
                label=""
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Products;
