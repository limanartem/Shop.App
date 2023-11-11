/* eslint-disable react-hooks/exhaustive-deps */
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dispatch, SetStateAction, createContext } from 'react';

export const GlobalSelectedCategoryContext = createContext({
  globalSelectedCategory: null,
  setGlobalSelectedCategory: (_: string) => {},
} as { globalSelectedCategory: string | null; setGlobalSelectedCategory: Dispatch<SetStateAction<string | null>> });

function CategoryContextProvider({ children }: { children?: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromParam = searchParams.get('category');

  const [globalSelectedCategory, setGlobalSelectedCategory] = useState<string | null>(
    categoryFromParam,
  );

  /*  const value = useMemo(
    () => ({ globalSelectedCategory, setGlobalSelectedCategory }),
    [globalSelectedCategory],
  ); */

  useEffect(() => {
    if (globalSelectedCategory && globalSelectedCategory !== categoryFromParam) {
      console.log('AppNavigation:globalSelectedCategory', globalSelectedCategory);
      setSearchParams({ category: globalSelectedCategory });
    } else if (globalSelectedCategory === '') {
      searchParams.delete('category');
      setSearchParams(searchParams);
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