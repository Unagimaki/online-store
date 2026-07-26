import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routes';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="page-layout">
    <header className="page-header">
      <div>
        <strong>Online Store</strong>
      </div>
      <nav>
        <Link to={ROUTES.products}>Products</Link>
        <Link to={ROUTES.login}>Login</Link>
      </nav>
    </header>
    <main className="page-content">{children}</main>
  </div>
);
