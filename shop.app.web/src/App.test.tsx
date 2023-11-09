import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, cleanup, within } from '@testing-library/react';
import App from './App';

describe('<App />', () => {
  afterEach(() => {
    cleanup();
  });

  it('should contain appBar', () => {
    render(<App />);
    const appBarElement = screen.getByTestId('appBar');
    expect(appBarElement).toBeInTheDocument();
  });

  it('should contain search within appBar', () => {
    render(<App />);
    const appBarElement = screen.getByTestId('appBar');
    const search = within(appBarElement).getByTestId('appBar-search');
    expect(search).toBeInTheDocument();
  });
});
