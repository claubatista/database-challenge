import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  type: 'income' | 'outcome';
  title: string;
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    type,
    title,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have balance');
    }

    let categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryExists);
    }

    const transactions = transactionsRepository.create({
      type,
      title,
      value,
      category: categoryExists,
    });

    await transactionsRepository.save(transactions);
    return transactions;
  }
}

export default CreateTransactionService;
