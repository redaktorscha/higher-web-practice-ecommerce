import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useAddToCartMutation } from '@/store/api';
import { selectIsAuthenticated } from '@/store/authSlice';

export function useAddProductToCart() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const addProductToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
    } catch {
      toast.error('Не удалось добавить товар в корзину');
    }
  };

  return {
    addProductToCart,
    isAddingToCart: isLoading,
  };
}
