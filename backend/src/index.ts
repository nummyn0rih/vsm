import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import shipmentRoutes from './routes/shipments';
import referenceRoutes from './routes/references';
import logRoutes from './routes/logs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

export default app;