import { useGetProductsQuery } from '../model/productApi';
import { Loader } from '../../../shared/ui/Loader';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { ProductCard } from './ProductCard';

export const ProductsPage = () => {
  const { data, isLoading, isError } = useGetProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorMessage message="Unable to load products. Please try again later." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No products found." />;
  }

  return (
    <section>
      <h1>Products</h1>
      <div className="grid">
        {data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
