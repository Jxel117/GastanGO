const { Transaction } = require('../models');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notification.service.js');

// --- IMPLEMENTACIÓN DETALLADA ---
// Este es el controlador para las transacciones. Su lógica principal es:
// 1. Crear una nueva transacción asociada al usuario autenticado (flujo de 4 toques).
// 2. Después de crearla, invocar al servicio de notificaciones para simular un recordatorio.
// 3. Obtener la lista de todas las transacciones para el usuario que hace la petición.

exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, amount, category, description } = req.body;
  const userId = req.user.id; // Obtenido del token JWT en el middleware

  try {
    const transaction = await Transaction.create({
      type,
      amount,
      category,
      description,
      userId,
    });

    // Simular el envío de una notificación para añadir más detalles después
    notificationService.scheduleReminder(userId, transaction.id);

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['date', 'DESC']], // Ordenar por fecha, las más recientes primero
    });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
