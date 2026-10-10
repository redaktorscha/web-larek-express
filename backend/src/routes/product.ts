import { Router } from 'express';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../controllers/product';
import {
  validateCreateProduct,
  validateObjectId,
  validateProductUpdate,
} from '../middlewares/product-validation';

const router = Router();

router.get('/', getProducts);
router.post('/', validateCreateProduct, createProduct);
router.patch('/:productId', validateObjectId, validateProductUpdate, updateProduct);
router.delete('/:productId', validateObjectId, deleteProduct);

export default router;
