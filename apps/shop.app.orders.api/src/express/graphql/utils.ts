import {
  GraphQLResolveInfo,
  FieldNode,
  SelectionSetNode,
  SelectionNode,
  FragmentDefinitionNode,
} from 'graphql';

/**
 * Check if a field is requested in the GraphQLResolveInfo.
 *
 * @param {string} fieldPath dot separated path to field to check
 * @param {GraphQLResolveInfo} info
 * @return {*}  {boolean}
 */
export const isFieldRequested = (fieldPath: string, info: GraphQLResolveInfo): boolean => {
  const fieldNodes = info.fieldNodes as FieldNode[];
  const pathElements = fieldPath.split('.');

  return fieldNodes.some((fieldNode) =>
    checkFieldInSelectionSet(fieldNode.selectionSet, pathElements, info.fragments),
  );
};

const checkFieldInSelectionSet = (
  selectionSet: SelectionSetNode | undefined,
  pathElements: string[],
  fragments: Record<string, FragmentDefinitionNode>,
): boolean => {
  while (selectionSet && pathElements.length > 0) {
    const currentField = pathElements.shift()!;
    const foundField = selectionSet.selections.find((selection: SelectionNode) => {
      if (selection.kind === 'Field' && selection.name.value === currentField) {
        return true;
      } else if (selection.kind === 'FragmentSpread') {
        const fragment = fragments[selection.name.value];
        return fragment != null;
      }
      return false;
    });

    if (!foundField) {
      return false;
    }

    if (pathElements.length === 0) {
      return true;
    }

    if (foundField.kind === 'Field' && foundField.selectionSet) {
      selectionSet = foundField.selectionSet;
    } else if (foundField.kind === 'FragmentSpread') {
      const fragment = fragments[foundField.name.value];
      if (fragment) {
        selectionSet = fragment.selectionSet;
        pathElements.unshift(currentField);
      }
    }
  }

  return false;
};
