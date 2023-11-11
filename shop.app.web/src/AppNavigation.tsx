/* eslint-disable react-hooks/exhaustive-deps */
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GlobalSelectedCategoryContext } from './App';

function AppNavigation({ children }: { children?: React.ReactNode }) {
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

export default AppNavigation;
