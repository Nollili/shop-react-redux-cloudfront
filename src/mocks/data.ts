import { OrderStatus } from "~/constants/order";
import { CartItem } from "~/models/CartItem";
import { Order } from "~/models/Order";
import { AvailableProduct, Product } from "~/models/Product";

export const products: Product[] = [
    {
    id: '19befc55-ea39-4ff0-8b63-e3a3c8b94f53',
    title: 'Classic White T-Shirt',
    description: '100% cotton, unisex, available in all sizes',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '889b35f2-4c60-4265-9ea7-b81ebbbdee39',
    title: 'Blue Denim Jeans',
    description: 'Slim fit, stretchable, various waist sizes',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1715758890151-2c15d5d482aa?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'f4850e7b-fc3d-40f3-a532-64919cec3e0b',
    title: 'Red Hoodie',
    description: 'Soft fleece, kangaroo pocket, drawstring hood',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1579269896398-4deb6cbdc320?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'c7630b15-10e5-4244-a003-8dcc2342d0c0',
    title: 'Black Leather Jacket',
    description: 'Genuine leather, biker style, limited edition',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1727524366429-27de8607d5f6?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '1169cf53-f439-4130-98d3-395ee35c6dcd',
    title: 'Green Chino Shorts',
    description: 'Lightweight, breathable, perfect for summer',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1667388624717-895854eea032?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

export const availableProducts: AvailableProduct[] = products.map(
  (product, index) => ({ ...product, count: index + 1 })
);

export const cart: CartItem[] = [
  {
    product: {
      description: "Short Product Description1",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      price: 24,
      title: "ProductOne",
      image: "",
    },
    count: 2,
  },
  {
    product: {
      description: "Short Product Description7",
      id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
      price: 15,
      title: "ProductName",
      image: "",
    },
    count: 5,
  },
];

export const orders: Order[] = [
  {
    id: "1",
    address: {
      address: "some address",
      firstName: "Name",
      lastName: "Surname",
      comment: "",
    },
    items: [
      { productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 2 },
      { productId: "7567ec4b-b10c-45c5-9345-fc73c48a80a1", count: 5 },
    ],
    statusHistory: [
      { status: OrderStatus.Open, timestamp: Date.now(), comment: "New order" },
    ],
  },
  {
    id: "2",
    address: {
      address: "another address",
      firstName: "John",
      lastName: "Doe",
      comment: "Ship fast!",
    },
    items: [{ productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 3 }],
    statusHistory: [
      {
        status: OrderStatus.Sent,
        timestamp: Date.now(),
        comment: "Fancy order",
      },
    ],
  },
];