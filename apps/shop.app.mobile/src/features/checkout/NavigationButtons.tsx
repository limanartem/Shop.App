import React from 'react';
import { Button } from 'react-native-paper';
import { useAppDispatch } from '../../app/hooks';
import { View, StyleSheet } from 'react-native';
import { previousStep } from '../../app/reducers/checkOutReducer';

const styles = StyleSheet.create({
  navigationContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 10,
  },
});

export default function NavigationButtons({
  nextAction,
  canNavigateBack = true,
  canNavigateForward = true,
  loading = false,
}: {
  nextAction: () => void | Promise<void>;
  canNavigateBack?: boolean;
  canNavigateForward?: boolean;
  loading?: boolean;
}) {
  const dispatch = useAppDispatch();

  return (
    <View style={styles.navigationContainer}>
      <Button
        mode="contained"
        onPress={async () => await nextAction()}
        icon="check"
        disabled={!canNavigateForward}
        loading={loading}
      >
        OK
      </Button>
      {canNavigateBack && (
        <Button mode="text" onPress={() => dispatch(previousStep())}>
          Back
        </Button>
      )}
    </View>
  );
}
