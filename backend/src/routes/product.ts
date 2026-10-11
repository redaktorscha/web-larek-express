import { Router } from 'express';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/product';
import {
  validateCreateProduct,
  validateObjectId,
  validateProductUpdate,
} from '../middlewares/product-validation';
import { requireAuth, requireExistingUser } from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', requireAuth, requireExistingUser, validateCreateProduct, createProduct);
router.patch(
  '/:productId',
  requireAuth,
  requireExistingUser,
  validateObjectId,
  validateProductUpdate,
  updateProduct
);
router.delete('/:productId', requireAuth, requireExistingUser, validateObjectId, deleteProduct);

export default router;
