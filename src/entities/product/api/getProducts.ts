import { BASE_URL } from "@/shared/api/config"

export const getProducts = async () => {
    const response = await fetch(`${BASE_URL}/products`)

    if (!response.ok) {
        throw new Error("Failed to fetch products")
    }

    return response.json() 
}