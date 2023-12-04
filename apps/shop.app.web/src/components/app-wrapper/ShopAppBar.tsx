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
  open: boolean;
  toggleDrawer: () => void;
  drawerWidth: number;
};

export function ShopAppBar({ open, toggleDrawer, drawerWidth }: ShopBarPropsType) {
  const user = useAppSelector(selectUser);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showCartPopup, setShowCartPopup] = React.useState(false);
  const [anchorElShoppingCart, setAnchorElShoppingCart] = React.useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) => state.shoppingCart.items);
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

  return (
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
          <Tooltip title="Go Home">
            <Link href="/">
              <CardMedia
                component="img"
                image="/shop-assets/logo/shop.app.logo.png"
                style={{ width: '48px' }}
              />
            </Link>
          </Tooltip>
        </Card>

        <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
          AI-Powered eCommerce
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
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
          </Tooltip>
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
