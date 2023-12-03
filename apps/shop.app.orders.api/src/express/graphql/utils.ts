import { GraphQLResolveInfo, FieldNode, SelectionSetNode, SelectionNode } from 'graphql';

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
    checkFieldInSelectionSet(fieldNode.selectionSet, pathElements),
  );
};

const checkFieldInSelectionSet = (
  selectionSet: SelectionSetNode | undefined,
  pathElements: string[],
): boolean => {
  while (selectionSet && pathElements.length > 0) {
    const currentField = pathElements.shift()!;
    const foundField = selectionSet.selections.find(
      (selection: SelectionNode) =>
        selection.kind === 'Field' && selection.name.value === currentField,
    ) as FieldNode;

    if (!foundField) {
      return false;
    }

    if (pathElements.length === 0) {
      return true;
    }

    if (foundField.selectionSet) {
      selectionSet = foundField.selectionSet;
    }
  }

  return false;
};
