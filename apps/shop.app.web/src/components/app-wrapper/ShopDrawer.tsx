import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useAppSelector } from '../../app/hooks';
import { selectCategories } from '../../app/reducers/categoriesReducer';
import { CategoriesTreeView } from '..';

export const drawerWidth: number = 240;

type DrawerPropsType = {
  open: boolean;
  toggleDrawer: () => void;
};


const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);


export function ShopDrawer({ open, toggleDrawer }: DrawerPropsType) {
  const categories = useAppSelector(selectCategories);
  const [categoryExpanded, setCategoryExpanded] = React.useState(true);

  return (
    <Drawer variant="permanent" open={open}>
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
          <CategoriesTreeView categories={categories} />
        </ListItem>
      )}

      <Divider sx={{ my: 1 }} />
    </List>
  </Drawer>
  )

}