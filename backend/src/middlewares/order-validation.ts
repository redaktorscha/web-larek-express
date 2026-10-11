import { celebrate, Joi, Segments } from 'celebrate';
import { RequestHandler } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const validateOrderBody = celebrate(
  {
    [Segments.BODY]: Joi.object({
      payment: Joi.string().valid('card', 'online').required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      total: Joi.number().required(),
      items: Joi.array().items(Joi.string().hex().length(24).required()).min(1).required(),
    }).required(),
  },
  { convert: false }
);

const validateOrderProducts: RequestHandler = async (req, _res, next) => {
  const { items, total } = req.body as { items: string[]; total: number };

  try {
    const products = await Product.find({ _id: { $in: items } })
      .select('_id price')
      .lean();
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const missingId = items.find((id) => !productsById.has(id.toLowerCase()));

    if (missingId) {
      next(new BadRequestError(`Товар ${missingId} не найден`));
      return;
    }

    const unavailableId = items.find((id) => productsById.get(id.toLowerCase())?.price === null);
    if (unavailableId) {
      next(new BadRequestError(`Товар ${unavailableId} не продается`));
      return;
    }

    const actualTotal = items.reduce(
      (sum, id) => sum + (productsById.get(id.toLowerCase())?.price ?? 0),
      0
    );

    if (actualTotal !== total) {
      next(new BadRequestError('Сумма заказа не совпадает со стоимостью товаров'));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

const validateOrder = [validateOrderBody, validateOrderProducts];

export default validateOrder;
