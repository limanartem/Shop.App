import React from 'react';
import {
  Box,
  Toolbar,
  Grid,
} from '@mui/material';
import { MainContentContainer } from '..';
import { ShopAppBar } from './ShopAppBar';
import { ShopDrawer } from './ShopDrawer';

const AppWrapper = ({ children }: { children?: React.ReactNode }) => {
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ShopAppBar open={open} toggleDrawer={toggleDrawer} />
      <ShopDrawer open={open} toggleDrawer={toggleDrawer} />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Grid container justifyContent="center">
          <MainContentContainer>{children}</MainContentContainer>
        </Grid>
      </Box>
    </Box>
  );
};

export default AppWrapper;
