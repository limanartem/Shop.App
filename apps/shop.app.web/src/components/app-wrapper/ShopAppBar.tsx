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
  Menu,
  Tooltip,
  Avatar,
  InputBase,
  CardMedia,
  Card,
  Button,
  Link,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { signOut } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import { selectUser, setUser } from '../../app/reducers/authReducer';
import { resetCheckout } from '../../app/reducers/checkOutReducer';
import { ShoppingCartPopup } from '../../features/shopping-cart/ShoppingCartPopup';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { drawerWidth } from './ShopDrawer';
import { DrawerOpenState } from '.';
import { assetUrl } from '../../utils/product-utils';

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

type ShopBarPropsType = {
  open: DrawerOpenState;
  toggleDrawer: () => void;
};

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  [theme.breakpoints.up('sm')]: {
    zIndex: theme.zIndex.drawer + 1,
  },
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up('sm')]: {
      marginLeft: { drawerWidth },
      width: `calc(100% - ${drawerWidth}px)`,
    },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export function ShopAppBar({ open, toggleDrawer }: ShopBarPropsType) {
  const user = useAppSelector(selectUser);
  const [anchorElShoppingCart, setAnchorElShoppingCart] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const items = useAppSelector((state) => state.shoppingCart.items);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
    <AppBar open={open.permanent || false} data-testid="appBar" position="absolute">
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
            marginRight: { sm: '36px' },
            ...(open.permanent && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Card sx={{ mr: 2 }}>
          <Tooltip title="Go Home">
            <Link href="/">
              <CardMedia
                component="img"
                image={assetUrl('/shop-assets/logo/shop.app.logo.png')}
                sx={{ width: { md: '48px', xs: '32px' } }}
              />
            </Link>
          </Tooltip>
        </Card>

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            AI-Powered eCommerce
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}></Box>
        <Box sx={{ flexGrow: 0, display: 'flex' }}>
          <Tooltip title="Search catalog">
            <Search data-testid="appBar-search">
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                sx={{ height: '100%' }}
              />
            </Search>
          </Tooltip>
          <Tooltip title="Open Shopping Cart">
            <IconButton
              size="large"
              color="inherit"
              onClick={(e) => {
                setAnchorElShoppingCart(e.currentTarget);
              }}
            >
              <Badge
                badgeContent={items.reduce((count, item) => count + item.quantity, 0)}
                color="success"
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <ShoppingCartPopup
            open={Boolean(anchorElShoppingCart)}
            anchorEl={anchorElShoppingCart}
            onClose={() => setAnchorElShoppingCart(null)}
          />
          <Box sx={{ flexGrow: 0, pl: 1 }}>
            {isLoggedIn && (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'primary.light' }} />
                </IconButton>
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
                  <MenuItem
                    onClick={() => {
                      navigate('/orders');
                      handleCloseUserMenu();
                    }}
                  >
                    <Typography textAlign="center">Orders</Typography>
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
  );
}
