import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

function ProductsPage() {
  return <div>Каталог товаров</div>;
}

function CartPage() {
  return <div>Корзина</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
