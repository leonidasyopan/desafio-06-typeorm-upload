import { getRepository, getCustomRepository, In } from 'typeorm';

import fs from 'fs';
import csvParse from 'csv-parse';

import path from 'path';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

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

    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const contactsReadStream = fs.createReadStream(fileCompletePath);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactionsImport: TransactionImport[] = [];
    const categoryList: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categoryList.push(category);
      transactionsImport.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentDBCategories = await categoryRepository.find({
      where: {
        title: In(categoryList),
      },
    });

    const existentDBCategoriesTitles = existentDBCategories.map(
      (category: Category) => category.title,
    );

    const newCategoriesForDB = categoryList
      .filter(category => !existentDBCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const addNewCategoriesToDB = await categoryRepository.create(
      newCategoriesForDB.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(addNewCategoriesToDB);

    const completeCategoriesList = [
      ...addNewCategoriesToDB,
      ...existentDBCategories,
    ];

    const addNewTransactionsToDB = await transactionRepository.create(
      transactionsImport.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: completeCategoriesList.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(addNewTransactionsToDB);

    await fs.promises.unlink(fileCompletePath);

    return addNewTransactionsToDB;
  }
}

export default ImportTransactionsService;
