import { Router } from 'express';
import uploadFile from '../controllers/upload';
import fileMiddleware from '../middlewares/file';
import { requireAuth, requireExistingUser } from '../middlewares/auth';

const uploadRouter = Router();

uploadRouter.post('/', requireAuth, requireExistingUser, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;
