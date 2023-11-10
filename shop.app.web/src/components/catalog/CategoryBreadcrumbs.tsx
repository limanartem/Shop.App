import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { ProductCategory } from '../../model';

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
  currentCategoryId,
}: {
  categories: ProductCategory[];
  currentCategoryId: string | null;
}) => {
  const categoryPath = currentCategoryId
    ? getCategoryPath(categories, Number.parseInt(currentCategoryId))
    : [];

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {categoryPath.map((category) => (
        <Link key={category.id} color="inherit" href="#">
          {category.title}
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default CategoryBreadcrumbs;
