/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dispatch, SetStateAction, createContext } from 'react';

export const GlobalSelectedCategoryContext = createContext({
  globalSelectedCategory: null,
  setGlobalSelectedCategory: (_: string) => {},
} as { globalSelectedCategory: string | null; setGlobalSelectedCategory: Dispatch<SetStateAction<string | null>> });

function CategoryContextProvider({ children }: { children?: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const categoryFromParam = searchParams.get('category');
  const navigate = useNavigate();

  const [globalSelectedCategory, setGlobalSelectedCategory] = useState<string | null>(
    categoryFromParam,
  );

  /*  const value = useMemo(
    () => ({ globalSelectedCategory, setGlobalSelectedCategory }),
    [globalSelectedCategory],
  ); */

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

  return (
    <GlobalSelectedCategoryContext.Provider
      value={{ globalSelectedCategory, setGlobalSelectedCategory }}
    >
      {children}
    </GlobalSelectedCategoryContext.Provider>
  );
}

export default CategoryContextProvider;
