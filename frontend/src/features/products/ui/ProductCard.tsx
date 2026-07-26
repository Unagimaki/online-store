import { Product } from '../model/productApi';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => (
  <article className="card product-card">
    <h3>{product.title}</h3>
    <p>{product.description}</p>
    <strong>${product.price.toFixed(2)}</strong>
  </article>
);
