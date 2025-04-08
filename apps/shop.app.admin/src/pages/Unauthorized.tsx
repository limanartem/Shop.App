import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Unauthorized = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };
  
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph align="center">
            You do not have permission to access this area.
            This section requires administrative privileges.
          </Typography>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Logout and Return to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
