import { styled } from '@mui/system';
import { DateTime } from './DateTime';
import { AuthRoutes, AuthWrapper } from './AuthWrapper';
import CategoriesTreeView from './CategoriesTreeView';
import { OrderedProductCard } from './OrderedProductCard';
import CategoryContextProvider from './CategoryContextProvider';

export { DateTime, AuthWrapper, AuthRoutes, CategoriesTreeView, OrderedProductCard, CategoryContextProvider }

export const MainContentContainer = styled('div')(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '700px',
  }
}));