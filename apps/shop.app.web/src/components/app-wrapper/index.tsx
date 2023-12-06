/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { Box, Toolbar, Grid, useMediaQuery, useTheme } from '@mui/material';
import { MainContentContainer } from '..';
import { ShopAppBar } from './ShopAppBar';
import { ShopDrawer } from './ShopDrawer';

export type DrawerOpenState = {
  permanent: boolean | null;
  temporary: boolean | null;
};

const AppWrapper = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.only('xs'));
  const [open, setOpen] = React.useState<DrawerOpenState>({
    permanent: isSmallScreen ? null : true,
    temporary: !isSmallScreen ? null : false,
  });

  useEffect(() => {
    setOpen({
      permanent: isSmallScreen ? null : open.permanent,
      temporary: !isSmallScreen ? null : open.temporary,
    });
  }, [isSmallScreen]);

  const toggleDrawer = () => {
    if (isSmallScreen === true) {
      setOpen({
        ...open,
        temporary: !open.temporary,
      });
    } else {
      setOpen({
        ...open,
        permanent: !open.permanent,
      });
    }
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
