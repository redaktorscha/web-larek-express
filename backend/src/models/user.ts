import mongoose, { Document } from 'mongoose';
import validator from 'validator';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    default: 'Ё-мое',
    minlength: [2, 'Минимальная длина поля name - 2'],
    maxlength: [30, 'Максимальная длина поля name - 30'],
  },
  email: {
    type: String,
    required: [true, 'Поле email не должно быть пустым'],
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'Должен быть валидный email адрес',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле password не должно быть пустым'],
    minlength: [6, 'Минимальная длина поля password - 6'],
    select: false,
  },
  tokens: [
    {
      token: { type: String, required: true, select: false },
    },
  ],
});

export default mongoose.model<IUser>('user', userSchema);
