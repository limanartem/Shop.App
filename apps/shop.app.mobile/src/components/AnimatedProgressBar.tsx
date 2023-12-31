import React from 'react';
import { ProgressBar, ProgressBarProps } from 'react-native-paper';
import { Animated } from 'react-native';

class ClassProgressBar extends React.Component {
  constructor(props: ProgressBarProps) {
    super(props);
  }

  render() {
    return <ProgressBar {...this.props} />;
  }
}

export const AnimatedProgressBar = Animated.createAnimatedComponent(ClassProgressBar);
