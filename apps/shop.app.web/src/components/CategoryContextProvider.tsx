import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectCategory } from '../app/reducers/searchReducer';

function CategoryContextProvider({ children }: { children?: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const categoryFromParam = searchParams.get('category');
  const navigate = useNavigate();

  const globalSelectedCategory = useAppSelector(selectCategory);

  useEffect(() => {
    if (
      globalSelectedCategory &&
      globalSelectedCategory !== '-1' &&
      globalSelectedCategory !== categoryFromParam
    ) {
      console.log('AppNavigation:globalSelectedCategory', globalSelectedCategory);
      navigate(`/catalog?category=${globalSelectedCategory}`);
    } else if (globalSelectedCategory === '' || globalSelectedCategory === '-1') {
      navigate('/catalog');
    }
  }, [globalSelectedCategory]);

  return <>{children}</>;
}

export default CategoryContextProvider;
