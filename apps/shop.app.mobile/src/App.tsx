import { Provider } from 'react-redux';
import { store } from './app/store';
import { AuthWrapper } from './components/AuthWrapper';
import Router from './components/Router';

export default function App() {
  return (
    <Provider store={store}>
      <AuthWrapper>
        <Router />
      </AuthWrapper>
    </Provider>
  );
}
