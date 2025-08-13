import type { ProductType } from "@/entities/product/type"

export const CartItem = (product: ProductType) => {
    const {description, price, imageUrl, title} = product
    return(
      <div className="size-100 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-cover"
              referrerPolicy="no-referrer"
            />
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
            {description}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold">{price} ₽</span>
          </div>
        </div>
      </div>
    )
}
