import { Router } from 'express';

import CreateCategoryService from '../services/CreateCategoryService';
// import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

// const transactionsRepository = new TransactionsRepository();
/*
transactionsRouter.get('/', async (request, response) => {
  // TODO
});
*/
transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();
  const createCategory = new CreateCategoryService();

  const categoryCheck = await createCategory.execute({
    title: category,
  });

  const category_id = categoryCheck.id;
  console.log(category_id);

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
