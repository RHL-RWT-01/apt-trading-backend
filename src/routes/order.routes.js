import express from 'express';
import { createOrder, deleteOrder, getOrders, updateOrder } from '../controllers/order.controllers.js';


const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
