import { celebrate, Joi, Segments } from 'celebrate';
import { Types } from 'mongoose';

const imageSchema = Joi.object({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
  size: Joi.number().optional(),
  mimetype: Joi.string().optional(),
});

const titleSchema = Joi.string().min(2).max(30).messages({
  'string.min': 'Минимальная длина поля "title" - 2',
  'string.max': 'Максимальная длина поля "title" - 30',
  'string.empty': 'Поле "title" должно быть заполнено',
});

export const validateCreateProduct = celebrate(
  {
    [Segments.BODY]: Joi.object({
      title: titleSchema.required(),
      image: imageSchema.required(),
      category: Joi.string().required().messages({
        'string.empty': 'Поле "category" должно быть заполнено',
      }),
      description: Joi.string().required().messages({
        'string.empty': 'Поле "description" должно быть заполнено',
      }),
      price: Joi.number().min(0).allow(null),
    }).required(),
  },
  { convert: false }
);

export const validateObjectId = celebrate({
  [Segments.PARAMS]: Joi.object({
    productId: Joi.string()
      .required()
      .custom((value: string, helpers) => {
        if (Types.ObjectId.isValid(value)) return value;
        return helpers.error('any.custom');
      })
      .messages({ 'any.custom': 'Невалидный id' }),
  }),
});

export const validateProductUpdate = celebrate(
  {
    [Segments.BODY]: Joi.object({
      title: titleSchema,
      image: imageSchema,
      category: Joi.string(),
      description: Joi.string(),
      price: Joi.number().min(0).allow(null),
    })
      .min(1)
      .required(),
  },
  { convert: false }
);
