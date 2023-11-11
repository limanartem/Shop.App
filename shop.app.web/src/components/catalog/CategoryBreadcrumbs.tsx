import { useCallback, useContext } from 'react';
import { Breadcrumbs, Button, Link } from '@mui/material';
import { ProductCategory } from '../../model';
import { GlobalSelectedCategoryContext } from '../../App';

const findCategoryById = (categories: ProductCategory[], categoryId: number) => {
  return categories.find((category) => category.id === categoryId);
};

const getCategoryPath = (categories: ProductCategory[], categoryId: number) => {
  const path = [];
  let currentCategory = findCategoryById(categories, categoryId);

  while (currentCategory) {
    path.unshift(currentCategory); // Add the current category to the beginning of the path
    currentCategory = findCategoryById(categories, currentCategory.parentCategoryId);
  }

  return path;
};

const CategoryBreadcrumbs = ({
  categories,
}: {
  categories: ProductCategory[];
}) => {
  const { globalSelectedCategory, setGlobalSelectedCategory } = useContext(
    GlobalSelectedCategoryContext,
  );

  const categoryPath = useCallback(() => {
    return globalSelectedCategory
      ? getCategoryPath(categories, Number.parseInt(globalSelectedCategory))
      : [];
  }, [categories, globalSelectedCategory]);

  return (
    <Breadcrumbs>
      {categoryPath().map((category) => (
        <Link key={category.id} color="inherit">
          <Button
            onClick={() => {
              setGlobalSelectedCategory(category.id.toString());
            }}
          >
            {category.title}
          </Button>
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default CategoryBreadcrumbs;
