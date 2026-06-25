import express, { Application } from 'express';
import dotenv from 'dotenv';
import dns from 'node:dns';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app: Application = express();

app.use(express.json());

connectDB();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Job Board API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;