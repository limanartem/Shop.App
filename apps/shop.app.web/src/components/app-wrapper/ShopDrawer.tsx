import React, { useEffect, useState } from 'react';
import { CSSObject, Theme, styled } from '@mui/material/styles';
import {
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
  Box,
  Drawer,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useAppSelector } from '../../app/hooks';
import {
  DataLoadingState,
  selectCategories,
  selectCategoriesStatus,
} from '../../app/reducers/categoriesReducer';
import { CategoriesTreeView } from '..';
import { TreeViewPlaceholder } from '../TreeViewPlaceholder';
import { DrawerOpenState } from '.';

export const drawerWidth: number = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

type DrawerPropsType = {
  open: DrawerOpenState;
  toggleDrawer: () => void;
};

const PermanentDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export function ShopDrawer({ open, toggleDrawer }: DrawerPropsType) {
  const categories = useAppSelector(selectCategories);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const [loading, setLoading] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = React.useState(true);

  useEffect(() => {
    setLoading(categoriesStatus === DataLoadingState.loading);
  }, [categoriesStatus]);

  const DrawerContent = (open: boolean, onSelectedChanged?: () => void) =>
    loading ? (
      <TreeViewPlaceholder />
    ) : (
      <List component="nav">
        <ListItemButton
          alignItems="flex-start"
          onClick={() => {
            if (!open) {
              toggleDrawer();
              setCategoryExpanded(true);
            } else {
              setCategoryExpanded(!categoryExpanded);
            }
          }}
          sx={{
            pb: open ? 0 : 2.5,
            '&:hover, &:focus': { '& svg': { opacity: open ? 1 : 0 } },
          }}
        >
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
          <KeyboardArrowDown
            sx={{
              mr: -1,
              opacity: 0,
              transform: categoryExpanded ? 'rotate(-180deg)' : 'rotate(0)',
              transition: '0.2s',
            }}
          />
        </ListItemButton>
        {open && categoryExpanded && (
          <ListItem>
            <CategoriesTreeView categories={categories} onSelectedChanged={onSelectedChanged} />
          </ListItem>
        )}

        <Divider sx={{ my: 1 }} />
      </List>
    );

  return (
    <Box sx={{ flexShrink: { sm: 0 } }} aria-label="categories">
      <PermanentDrawer
        variant="permanent"
        open={open.permanent || false}
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        {DrawerContent(open.permanent || false)}
      </PermanentDrawer>
      <Drawer
        variant="temporary"
        anchor="left"
        open={open.temporary || false}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {DrawerContent(open.temporary || false, () => toggleDrawer())}
      </Drawer>
    </Box>
  );
}
