import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const confirmTransactionExists = await transactionRepository.findOne({
      where: { id },
    });

    if (!confirmTransactionExists) {
      throw new AppError(`There is no transactions with this ID.`);
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
