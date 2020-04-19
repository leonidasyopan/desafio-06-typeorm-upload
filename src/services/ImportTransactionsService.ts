import fs from 'fs';
import neatCsv from 'neat-csv';

import path from 'path';

import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';
import CreateCategoryService from './CreateCategoryService';

import Transaction from '../models/Transaction';

// import AppError from '../errors/AppError';

interface TransactionImport {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const fileCompletePath = path.join(uploadConfig.directory, filename);

    const createTransaction = new CreateTransactionService();
    const createCategory = new CreateCategoryService();

    const transactions: Transaction[] = [];

    const rawData = await fs.promises.readFile(fileCompletePath);

    const organizedData = await neatCsv<TransactionImport>(rawData, {
      mapHeaders: ({ header }) => header.trim(),
      mapValues: ({ value }) => value.trim(),
    });

    await organizedData.map(async transaction => {
      const categoryCheck = await createCategory.execute({
        title: transaction.category,
      });

      const category_id = categoryCheck.id;

      const trans = await createTransaction.execute({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category_id,
      });

      await transactions.push(trans);
    });

    await fs.promises.unlink(fileCompletePath);

    return transactions;
  }
}

export default ImportTransactionsService;
