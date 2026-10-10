import mongoose, { ObjectId } from 'mongoose';

interface IImagePath {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  _id: ObjectId;
  title: string;
  image: IImagePath;
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле title обязательно для заполнения'],
    unique: true,
    minlength: [2, 'Минимально 2 символа в поле title'],
    maxlength: [30, 'Максимально 30 символов в поле title'],
    trim: true,
  },
  image: {
    type: new mongoose.Schema<IImagePath>(
      {
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
      },
      { _id: false }
    ),
    required: [true, 'Поле image обязательно для заполнения'],
  },
  category: {
    type: String,
    required: [true, 'Поле category обязательно для заполнения'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  price: {
    type: Number,
    default: null,
    min: 0,
  },
});

export default mongoose.model<IProduct>('product', productSchema, 'weblarek');
