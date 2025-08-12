import { getProducts } from "@/entities/product/api/getProducts";
import type { ProductType } from "@/entities/product/type";
import { ProductCard } from "@/entities/product/ui/ProductCard";
import { useEffect, useState } from "react";

export const ProductsPage = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProductType[]>([])
    
    useEffect(() => {
        setLoading(true)
        getProducts()
        .then(data => {
            console.log(data);
            setData(data)
        })
        .finally(() => setLoading(false))
    }, [])

    if (loading) return <h1>Loading...</h1>


    

    return(
        <section>
            <h1>Products</h1>
            <ul>

                {
                    data.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))  
                }
                
            </ul>
        </section>
    )
}