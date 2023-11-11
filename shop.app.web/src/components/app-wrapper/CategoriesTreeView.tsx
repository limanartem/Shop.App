import Box from '@mui/material/Box';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ProductCategory } from '../../model';
import { GlobalSelectedCategoryContext } from '../../App';
import { SyntheticEvent, useContext, useEffect, useState } from 'react';

interface RenderTree {
  id: string;
  name: string;
  children?: RenderTree[];
}

const getSubCategories = (id: number | null, categories: ProductCategory[]): RenderTree[] =>
  categories
    .filter((category) => category.parentCategoryId === id)
    .map((category) => ({
      id: category.id.toString(),
      name: category.title,
      children: getSubCategories(category.id, categories),
    }));

const data = (categories: ProductCategory[]): RenderTree => {
  return {
    id: 'root',
    name: '',
    children: getSubCategories(null, categories),
  };
};

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

export default function CategoriesTreeView({ categories }: { categories: ProductCategory[] }) {
  const { globalSelectedCategory, setGlobalSelectedCategory } = useContext(
    GlobalSelectedCategoryContext,
  );

  const [selected, setSelected] = useState<string | null>(globalSelectedCategory || '');
  const [expanded, setExpanded] = useState<string[]>([]);
  const handleToggle = (_: SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  useEffect(() => {
    if (globalSelectedCategory) {
      const path = getCategoryPath(categories, Number.parseInt(globalSelectedCategory));
      setExpanded(path.map((category) => category.id.toString()));
      setSelected(globalSelectedCategory);
    }
  }, [globalSelectedCategory, categories]);

  const renderTree = (nodes?: RenderTree[]) => {
    return nodes?.map((node) => (
      <TreeItem key={node.id} nodeId={node.id} label={node.name}>
        {Array.isArray(node.children) ? renderTree(node.children) : null}
      </TreeItem>
    ));
  };

  return (
    <Box sx={{ minHeight: 110, flexGrow: 1, maxWidth: 300 }}>
      <TreeView
        aria-expanded={true}
        expanded={expanded}
        selected={selected}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeToggle={handleToggle}
        onNodeSelect={(_, nodeIds) => {
          setSelected(nodeIds);
          setGlobalSelectedCategory(nodeIds);
        }}
      >
        {renderTree(data(categories).children)}
      </TreeView>
    </Box>
  );
}
