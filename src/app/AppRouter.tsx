import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import { ProductPage } from "@/pages/ProductPage/ui/ProductPage";
import { CartPage } from "@/pages/CartPage/ui/CartPage";
import { CatalogPage } from "@/pages/CatalogPage/ui/CatalogPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
