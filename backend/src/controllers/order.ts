import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

const createOrder: RequestHandler = (req, res) => {
  res.status(201).json({ id: randomUUID(), total: req.body.total });
};

export default createOrder;
