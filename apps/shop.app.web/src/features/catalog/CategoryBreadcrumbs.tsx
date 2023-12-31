import { useEffect, useState } from 'react';
import { Breadcrumbs, Button, Link } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCategory, setCategory } from '../../app/reducers/searchReducer';
import { ProductCategory } from '@shop.app/lib.client-data/dist/model';

const findCategoryById = (categories: ProductCategory[], categoryId?: number) => {
  return categories.find((category) => category.id === categoryId);
};

const getCategoryPath = (categories: ProductCategory[], categoryId: number) => {
  const path = [];
  let currentCategory = findCategoryById(categories, categoryId);

  while (currentCategory) {
    path.unshift(currentCategory); // Add the current category to the beginning of the path
    currentCategory = findCategoryById(categories, currentCategory.parentCategoryId);
  }

  return [{ id: -1, title: 'All' }].concat(path);
};

const CategoryBreadcrumbs = ({
  categories,
  currentTotal,
}: {
  categories: ProductCategory[];
  currentTotal: number;
}) => {
  const globalSelectedCategory = useAppSelector(selectCategory);
  const dispatch = useAppDispatch();
  const [categoryPath, setCategoryPath] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    const path = globalSelectedCategory
      ? getCategoryPath(categories, Number.parseInt(globalSelectedCategory))
      : [];
    setCategoryPath(path);
  }, [categories, globalSelectedCategory]);

  return (
    <Breadcrumbs style={{ marginLeft: 16 }}>
      {categoryPath.map((category, index) => (
        <Link key={category.id} color="inherit" padding={0} margin={0}>
          <Button
            style={{ padding: 0, margin: 0, minWidth: 0 }}
            variant="text"
            onClick={() => {
              dispatch(setCategory(category.id.toString()));
            }}
          >
            {category.title} {index === categoryPath.length - 1 && `(${currentTotal})`}
          </Button>
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default CategoryBreadcrumbs;
