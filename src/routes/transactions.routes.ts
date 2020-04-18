import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import CreateCategoryService from '../services/CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

// const transactionsRepository = new TransactionsRepository();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();
  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });

  transactions.map(transaction => {
    delete transaction.created_at;
    delete transaction.updated_at;
    delete transaction.category.created_at;
    delete transaction.category.updated_at;
    return transaction;
  });

  const completeData = {
    transactions,
    balance,
  };

  return response.json(completeData);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();
  const createCategory = new CreateCategoryService();

  const categoryCheck = await createCategory.execute({
    title: category,
  });

  const category_id = categoryCheck.id;

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category_id,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  deleteTransaction.execute({
    id,
  });

  return response.json({ message: 'Transaction Deleted Successfully' });
});

transactionsRouter.post('/import', async (request, response) => {});

export default transactionsRouter;
