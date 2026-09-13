import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router';

export function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="bottom-center" />
    </>
  );
}
