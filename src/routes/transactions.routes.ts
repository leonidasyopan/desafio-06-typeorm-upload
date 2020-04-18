import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import CreateCategoryService from '../services/CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

// const transactionsRepository = new TransactionsRepository();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

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
/*
transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});
*/
export default transactionsRouter;
