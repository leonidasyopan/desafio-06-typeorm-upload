// import { getRepository } from 'typeorm';
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';
import CreateTransactionService from './CreateTransactionService';
import CreateCategoryService from './CreateCategoryService';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

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

    const transactions: TransactionImport[] = [];
    const transactionsCreated: Transaction[] = [];

    fs.createReadStream(fileCompletePath)
      .pipe(csv({ columns: true, from_line: 1, trim: true }))
      .on('data', row => {
        try {
          transactions.push(row);
          console.log(transactions);
        } catch (err) {
          throw new AppError(
            'There was an error uploading the file. Please try again.',
          );
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });

    console.log(`outside importattion. Before map`);

    transactions.map(async transaction => {
      const categoryCheck = await createCategory.execute({
        title: transaction.category,
      });

      const category_id = categoryCheck.id;
      console.log(category_id);

      const trans = await createTransaction.execute({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category_id,
      });

      console.log(trans);
      transactionsCreated.push(trans);
    });

    return transactionsCreated;
  }
}

export default ImportTransactionsService;
