import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/store";

export function Header() {
  const items = useSelector((state: RootState) => state.cart.items.length);
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Логотип */}
        <Link to="/" className="text-xl font-bold">
          MyShop
        </Link>

        {/* Иконка корзины */}
        <Link to="/cart" className="relative">
          <ShoppingCart size={24} />
          {/* Заглушка для счётчика, потом подключим Redux */}
          <span className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white text-xs px-1">
            {items || 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
