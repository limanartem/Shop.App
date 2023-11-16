import Box from '@mui/material/Box';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ProductCategory } from '../model';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectCategory, setCategory } from '../app/reducers/searchReducer';

interface RenderTree {
  id: number;
  name: string;
  children?: RenderTree[];
}

const getSubCategories = (id: number | null, categories: ProductCategory[]): RenderTree[] =>
  categories
    .filter((category) => category.parentCategoryId === id)
    .map((category) => ({
      id: category.id,
      name: category.title,
      children: getSubCategories(category.id, categories),
    }));

const data = (categories: ProductCategory[]): RenderTree => {
  return {
    id: -1,
    name: 'All',
    children: getSubCategories(null, categories),
  };
};

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

  return path;
};

export default function CategoriesTreeView({ categories }: { categories: ProductCategory[] }) {
  const globalSelectedCategory = useAppSelector(selectCategory);
  const dispatch = useAppDispatch();

  const [selected, setSelected] = useState<string | null>(globalSelectedCategory || '-1');
  const [expanded, setExpanded] = useState<string[]>(['-1']);
  const handleToggle = (_: SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  useEffect(() => {
    if (globalSelectedCategory) {
      const path = getCategoryPath(categories, Number.parseInt(globalSelectedCategory));
      setExpanded(['-1'].concat(path.map((category) => category.id.toString())));
      setSelected(globalSelectedCategory);
    }
  }, [globalSelectedCategory, categories]);

  const renderTree = (nodes?: RenderTree[]) => {
    return nodes?.map((node) => (
      <TreeItem key={node.id} nodeId={node.id.toString()} label={node.name} >
        {Array.isArray(node.children) ? renderTree(node.children) : null}
      </TreeItem>
    ));
  };

  return (
    <Box sx={{  flexGrow: 1, maxWidth: 300 }}>
      <TreeView
        aria-expanded={true}
        expanded={expanded}
        selected={selected}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeToggle={handleToggle}
        onNodeSelect={(_, nodeIds) => {
          setSelected(nodeIds);
          dispatch(setCategory(nodeIds));
        }}
      >
        {renderTree([data(categories)])}
      </TreeView>
    </Box>
  );
}
