// import { getRepository } from 'typeorm';
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';
// import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

/*
interface TransactionImport {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_id: string;
}
*/

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<void> /* <Transaction[]> */ {
    // const transactionRepository = getRepository(Transaction);
    const fileCompletePath = path.join(uploadConfig.directory, filename);

    fs.createReadStream(fileCompletePath)
      .pipe(csv())
      .on('data', row => {
        try {
          console.log(row);
        } catch (err) {
          console.log(err);
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
  }
}

export default ImportTransactionsService;
