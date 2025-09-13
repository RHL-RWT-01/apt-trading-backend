import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import ordersRouter from './routes/order.routes.js';
import Order from './models/Order.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: '*' }
});

app.use('/api/orders', ordersRouter);

app.get('/', (req, res) => res.send({ status: 'ok' }));

io.on('connection', (socket) => {
    console.log('Client connected', socket.id);

    socket.on('get_initial', async () => {
        const orders = await Order.find().sort({ updatedAt: -1 }).limit(100);
        socket.emit('initial_list', orders);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');

        const changeStream = Order.watch([], { fullDocument: 'updateLookup' });

        changeStream.on('change', (change) => {
            console.log('Change detected:', change.operationType);

            let payload = {
                operationType: change.operationType,
                documentKey: change.documentKey,
                fullDocument: change.fullDocument || null,
                updateDescription: change.updateDescription || null
            };

            io.emit('orders_change', payload);
        });

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

start();
