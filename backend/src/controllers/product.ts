import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';

export const getProducts: RequestHandler = async (_req, res) => {
  try {
    const items = await Product.find();
    res.json({ total: items.length, items });
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить товары' });
  }
};

export const createProduct: RequestHandler = async (req, res) => {
  const { title, image, category, description, price } = req.body ?? {};

  try {
    const product = await Product.create({ title, image, category, description, price });
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error instanceof Error && 'code' in error && error.code === 11000) {
      res.status(409).json({ error: 'Товар с таким названием уже существует' });
      return;
    }

    res.status(500).json({ error: 'Не удалось создать товар' });
  }
};
