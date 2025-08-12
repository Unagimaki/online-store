import type { ProductType } from "@/entities/product/type"

export const CartItem = (product: ProductType) => {
    return(
        <div>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <img src={product.imageUrl} alt={product.title} className="w-32 h-32 object-cover" />
        </div>
    )
}