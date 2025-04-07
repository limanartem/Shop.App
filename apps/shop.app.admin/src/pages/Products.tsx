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
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import { fetchProducts, updateProduct, createProduct } from '../store/slices/productsSlice';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

const Products = () => {
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'price', headerName: 'Price', width: 130 },
    { field: 'available', headerName: 'Available', width: 130, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params: GridRenderCellParams<any, any, any>) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleEdit(params.row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    setEditProduct(product);
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
