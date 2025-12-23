const express = require('express');
const { createTransaction, getTransactions } = require('../controllers/transaction.controller.js'); 
const { verifyToken } = require('../middlewares/auth.middleware');
const { check } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction (4-tap flow)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - category
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [expense, income]
 *               amount:
 *                 type: number
 *                 format: double
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  [
    verifyToken,
    check('type', 'Type is required and must be expense or income').isIn(['expense', 'income']),
    check('amount', 'Amount is required and must be a positive number').isFloat({ gt: 0 }),
    check('category', 'Category is required').not().isEmpty(),
  ],
  createTransaction
);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getTransactions);

module.exports = router;
