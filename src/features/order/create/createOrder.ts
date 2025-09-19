import type { CartItemType } from "@/entities/cart-item/type";

export const createOrder = (items: CartItemType[]) => {
  if (!items.length) {
    console.warn("Корзина пуста, заказ не создан");
    return;
  }

  const order = {
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.amount,
      price: item.price,
      total: item.amount * item.price,
    })),
    totalPrice: items.reduce((acc, i) => acc + i.amount * i.price, 0),
    createdAt: new Date().toISOString(),
  };

  console.log("Заказ создан:", order);

  return order;
};
