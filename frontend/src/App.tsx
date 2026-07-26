import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from './shared/routes/routes';
import { Layout } from './shared/layout/Layout';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { ProductsPage } from './pages/ProductsPage/ProductsPage';
import { ProtectedRoute } from './shared/routes/ProtectedRoute';

const App = () => (
  <Layout>
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route
        path={ROUTES.products}
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.products} replace />} />
    </Routes>
  </Layout>
);

export default App;
