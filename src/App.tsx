import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { WeddingProvider } from '@/context/WeddingContext';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WeddingProvider>
          <AppRoutes />
        </WeddingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
