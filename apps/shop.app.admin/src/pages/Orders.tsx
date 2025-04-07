import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { RootState } from '../store';
import { fetchOrders, updateOrderStatus } from '../store/slices/ordersSlice';

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId: string, newStatus: string): Promise<void> => {
    await dispatch(updateOrderStatus({ orderId, status: newStatus }));
    setOpen(false);
    setSelectedOrder(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 130 },
    { field: 'customerEmail', headerName: 'Customer', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        return <Chip
          label={params.value}
          color={
            params.value === 'SHIPPED'
              ? 'success'
              : params.value === 'PROCESSING'
              ? 'warning'
              : 'default'
          }
        /> as React.ReactNode;
      }
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      width: 130,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    { field: 'createdAt', headerName: 'Order Date', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        return <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSelectedOrder(params.row);
            setOpen(true);
          }}
        >
          Update Status
        </Button> as React.ReactNode;
      }
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Orders
      </Typography>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedOrder?.status || ''}
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                setSelectedOrder({ ...selectedOrder, status: e.target.value })
              }
            >
              <MenuItem value="NEW">New</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              handleStatusChange(selectedOrder.id, selectedOrder.status)
            }
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
