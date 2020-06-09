import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStored = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (productsStored) {
        setProducts(JSON.parse(productsStored));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const cartProducts = [...products];
      const productIndex = cartProducts.findIndex(
        prod => prod.id === product.id,
      );
      if (productIndex !== -1) {
        cartProducts[productIndex].quantity += 1;
      } else {
        const newProduct = { ...product, quantity: 1 };
        cartProducts.push(newProduct);
      }
      setProducts([...cartProducts]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const cartProducts = [...products];
      const productIndex = cartProducts.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        cartProducts[productIndex].quantity += 1;
        setProducts([...cartProducts]);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const cartProducts = [...products];
      const productIndex = cartProducts.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        if (cartProducts[productIndex].quantity === 1) {
          cartProducts.splice(productIndex, 1);
        } else {
          cartProducts[productIndex].quantity -= 1;
        }

        setProducts([...cartProducts]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
