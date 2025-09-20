import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/store";
import { selectCartCount } from "@/features/cart/model/selectors";

export function Header() {
  const cartCount = useSelector((state: RootState) => selectCartCount(state));

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">

        <Link to="/" className="text-xl font-bold">
          MyShop
        </Link>

        <Link to="/cart" className="relative">
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white text-xs px-1 min-w-5 h-5 grid place-items-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
