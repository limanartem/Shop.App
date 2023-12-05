import { styled } from '@mui/material/styles';
import {
  Box,
} from '@mui/material';
import { Skeleton } from '@mui/material';
import { TreeItem, TreeView } from '@mui/x-tree-view';

const treeData = [
  {
    id: '1',
    name: 'Parent 1',
    children: [
      {
        id: '2',
        name: 'Child 1',
        children: [
          { id: '3', name: 'Grandchild 1' },
          { id: '4', name: 'Grandchild 2' },
        ],
      },
      {
        id: '5',
        name: 'Child 2',
        children: [
          { id: '6', name: 'Grandchild 3' },
          { id: '7', name: 'Grandchild 4' },
        ],
      },
    ],
  },
];

const SkeletonItem = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
});

const renderSkeletonTreeItems = (nodes: any[]) =>
  nodes.map((node) => (
    <TreeItem key={node.id} nodeId={node.id}>
      <SkeletonItem>
        <Skeleton variant="text" width="100%" animation="wave" />
      </SkeletonItem>
      {Array.isArray(node.children) ? renderSkeletonTreeItems(node.children) : null}
    </TreeItem>
  ));

export const TreeViewPlaceholder = () => (
  <Box sx={{ marginRight: 2 }}>
    <TreeView
      sx={{ margin: 1 }}
      aria-label="loading tree"
      defaultCollapseIcon={<></>}
      defaultExpandIcon={<></>}
      expanded={['1', '2', '3', '4', '5', '6', '7']}
      disableSelection={true}
      disabledItemsFocusable={true}
    >
      {renderSkeletonTreeItems(treeData)}
    </TreeView>
  </Box>
);
