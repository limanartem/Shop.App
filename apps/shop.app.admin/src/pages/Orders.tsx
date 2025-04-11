import React, { useEffect, useState } from 'react';
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
  TextField,
  Grid,
  Paper,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridFilterModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { RootState } from '../store';
import { fetchOrders, updateOrderStatus, setOrderFilters, setOrderSorting } from '../store/slices/ordersSlice';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';

/**
 * Custom toolbar component for the DataGrid
 */
const OrdersToolbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = () => {
    dispatch(setOrderFilters({ searchTerm }));
    dispatch(fetchOrders());
  };

  const handleRefresh = () => {
    dispatch(fetchOrders());
  };

  return (
    <GridToolbarContainer>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <GridToolbarFilterButton data-testid="orders-filter-button" />
        </Grid>
        <Grid item>
          <GridToolbarExport data-testid="orders-export-button" />
        </Grid>
        <Grid item xs>
          <TextField
            size="small"
            placeholder="Search orders..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="orders-search-input"
            InputProps={{
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={handleSearch}
                  data-testid="orders-search-button"
                >
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Grid>
        <Grid item>
          <Tooltip title="Refresh orders">
            <IconButton onClick={handleRefresh} data-testid="orders-refresh-button">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
};

/**
 * Orders page component for managing customer orders
 */
const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, filters, sorting } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId: string, newStatus: string): Promise<void> => {
    await dispatch(updateOrderStatus({ orderId, status: newStatus }));
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleFilterChange = (filterModel: GridFilterModel) => {
    dispatch(setOrderFilters({ filterModel }));
  };

  const handleSortModelChange = (sortModel: GridSortModel) => {
    dispatch(setOrderSorting(sortModel));
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 130, filterable: true },
    { field: 'customerEmail', headerName: 'Customer', width: 200, filterable: true },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      filterable: true,
      renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'SHIPPED':
            case 'dispatched':
            case 'DISPATCHED':
              return 'success';
            case 'PROCESSING':
            case 'confirmed':
            case 'CONFIRMED':
              return 'warning';
            case 'DELIVERED':
            case 'delivered':
              return 'success';
            case 'CANCELLED':
            case 'FAILED':
            case 'failed':
              return 'error';
            case 'PAID':
            case 'paid':
              return 'info';
            default:
              return 'default';
          }
        };

        return <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          data-testid={`order-status-${params.row.id}`}
        /> as React.ReactNode;
      }
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      width: 130,
      type: 'number',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'createdAt',
      headerName: 'Order Date',
      width: 200,
      type: 'dateTime',
      filterable: true,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        return (
          <Box>
            <Tooltip title="View Order Details">
              <IconButton
                size="small"
                onClick={() => {
                  // TODO: Implement view order details in Iteration 1
                  console.log('View order details', params.row.id);
                }}
                data-testid={`view-order-${params.row.id}`}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedOrder(params.row);
                setOpen(true);
              }}
              data-testid={`update-order-${params.row.id}`}
              sx={{ ml: 1 }}
            >
              Update Status
            </Button>
          </Box>
        ) as React.ReactNode;
      }
    },
  ];

  return (
    <Paper sx={{ height: 650, width: '100%', p: 2 }}>
      <Toolbar disableGutters>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }} data-testid="orders-title">
          Orders
        </Typography>
      </Toolbar>
      
      <Box sx={{ height: 550, width: '100%', mt: 2 }}>
        <DataGrid
          rows={orders}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          filterMode="server"
          onFilterModelChange={handleFilterChange}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          initialState={{
            sorting: {
              sortModel: sorting,
            },
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          slots={{
            toolbar: OrdersToolbar,
          }}
          data-testid="orders-grid"
        />
      </Box>
      
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        data-testid="update-order-dialog"
      >
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
              data-testid="order-status-select"
            >
              <MenuItem value="pending" data-testid="status-option-pending">Pending</MenuItem>
              <MenuItem value="confirmed" data-testid="status-option-confirmed">Confirmed</MenuItem>
              <MenuItem value="paid" data-testid="status-option-paid">Paid</MenuItem>
              <MenuItem value="dispatched" data-testid="status-option-dispatched">Dispatched</MenuItem>
              <MenuItem value="delivered" data-testid="status-option-delivered">Delivered</MenuItem>
              <MenuItem value="cancelled" data-testid="status-option-cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)}
            data-testid="cancel-status-update-button"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleStatusChange(selectedOrder.id, selectedOrder.status)
            }
            data-testid="confirm-status-update-button"
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Orders;
