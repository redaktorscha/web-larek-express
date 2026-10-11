import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { ensureImageExists, removeProductImage, saveProductImage } from '../helpers/product-image';

const editableFields = new Set(['title', 'image', 'category', 'description', 'price']);

export const getProducts: RequestHandler = async (_req, res, next) => {
  try {
    const items = await Product.find();
    res.json({ total: items.length, items });
  } catch (error) {
    next(error);
  }
};

export const createProduct: RequestHandler = async (req, res, next) => {
  const { title, image, category, description, price } = req.body ?? {};

  try {
    await ensureImageExists(image.fileName);
    const product = await Product.create({ title, image, category, description, price });
    try {
      await saveProductImage(image.fileName);
    } catch (error) {
      await Product.findByIdAndDelete(product._id);
      throw error;
    }
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Ошибка валидации данных при создании товара'));
      return;
    }

    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    next(error);
  }
};

export const updateProduct: RequestHandler = async (req, res, next) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    next(new BadRequestError('Некорректный идентификатор товара'));
    return;
  }

  const updates = req.body;
  if (
    !updates ||
    typeof updates !== 'object' ||
    Array.isArray(updates) ||
    !Object.keys(updates).length ||
    Object.keys(updates).some((field) => !editableFields.has(field))
  ) {
    next(new BadRequestError('Некорректные данные для обновления товара'));
    return;
  }

  try {
    if (updates.image) await ensureImageExists(updates.image.fileName);
    const previousProduct = await Product.findById(productId);
    if (!previousProduct) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    if (updates.image) {
      await saveProductImage(updates.image.fileName);
      const previousImage = previousProduct.image.fileName;
      if (previousImage !== updates.image.fileName) {
        const stillUsed = await Product.exists({ 'image.fileName': previousImage });
        if (!stillUsed) await removeProductImage(previousImage);
      }
    }

    res.json(product);
  } catch (error) {
    if (
      error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError
    ) {
      next(new BadRequestError('Ошибка валидации данных при обновлении товара'));
      return;
    }

    if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }

    next(error);
  }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    next(new BadRequestError('Некорректный идентификатор товара'));
    return;
  }

  try {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};
