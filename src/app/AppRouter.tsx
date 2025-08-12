import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { ProductsPage } from "@/pages/ProductsPage/ui/ProductsPage";
import { ProductPage } from "@/pages/ProductPage/ui/ProductPage";

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
          <Route path="/product/:id" element={<ProductPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
