import path from 'path';
import fs from 'fs';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

interface TransactionImport {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_id: string;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    // TODO
  }
}

export default ImportTransactionsService;
