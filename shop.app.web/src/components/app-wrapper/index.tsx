import React, { useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import {
  MenuItem,
  Box,
  Typography,
  Toolbar,
  IconButton,
  Badge,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Avatar,
  InputBase,
  CardMedia,
  Card,
  ListItem,
  Button,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import CategoriesTreeView from './CategoriesTreeView';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ShoppingCartPopup } from '../shopping-cart/ShoppingCartPopup';
import { signOut } from 'supertokens-auth-react/recipe/session';
import { useNavigate } from 'react-router-dom';
import { selectCategories } from '../../app/reducers/categoriesReducer';
import { selectUser, setUser } from '../../app/reducers/authReducer';
import { resetCheckout } from '../../app/reducers/checkOutReducer';

const drawerWidth: number = 240;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

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

const AppWrapper = ({ children }: { children?: React.ReactNode }) => {
  const categories = useAppSelector(selectCategories);
  const user = useAppSelector(selectUser);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showCartPopup, setShowCartPopup] = React.useState(false);
  const [anchorElShoppingCart, setAnchorElShoppingCart] = React.useState<null | HTMLElement>(null);
  const [categoryExpanded, setCategoryExpanded] = React.useState(true);
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.shoppingCart.items);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setOpen(!open);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    setIsLoggedIn(user != null);
  }, [user]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute" open={open} data-testid="appBar">
        <Toolbar
          sx={{
            pr: '24px', // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Card sx={{ mr: 2 }}>
            <CardMedia
              component="img"
              image="/shop-assets/logo/shop.app.logo.png"
              style={{ width: '48px' }}
            />
          </Card>

          <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            AI-Powered eCommerce
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Search data-testid="appBar-search">
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </Search>
            <IconButton
              size="large"
              color="inherit"
              onClick={(e) => {
                //if (items.length) {
                setAnchorElShoppingCart(e.currentTarget);
                setShowCartPopup(true);
                //}
              }}
            >
              <Badge
                badgeContent={items.reduce((count, item) => count + item.quantity, 0)}
                color="success"
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <ShoppingCartPopup
              open={showCartPopup}
              anchorEl={anchorElShoppingCart}
              onClose={() => setShowCartPopup(false)}
            />
            <Box sx={{ flexGrow: 0, pl: 1 }}>
              {isLoggedIn && (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt="Max Muster" sx={{ bgcolor: 'primary.light' }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      onClick={async () => {
                        // TODO: handle in a better place
                        await signOut();
                        dispatch(setUser(null));
                        dispatch(resetCheckout());
                        document.location.reload();
                      }}
                    >
                      <Typography textAlign="center">Sign Out</Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}
              {!isLoggedIn && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate('auth')}
                  sx={{ mt: 0.5 }}
                >
                  Log In
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
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
                setOpen(true);
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
        {children}
      </Box>
    </Box>
  );
};

export default AppWrapper;
