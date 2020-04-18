// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_id: string;
}

interface FullInfo {
  id: string;
  title: string;
  value: number;
  type: string;
  category: {
    id: string;
    title: string;
  };
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_id,
  }: Request): Promise<FullInfo> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createCategory = new CreateCategoryService();

    const balance = await transactionsRepository.getBalance();
    const { total } = balance;

    if (type === 'outcome' && Number(value) > Number(total)) {
      throw new AppError(`You don't have this amount to spend.`);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    const category = await createCategory.execute({
      title,
    });

    const trasactionFullInfo = {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category: {
        id: category.id,
        title: category.title,
      },
    };

    return trasactionFullInfo;
  }
}

export default CreateTransactionService;
