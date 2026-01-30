import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import logger from './config/logger';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://wealthmax-frontend.onrender.com',
    'https://wealthmax-frontend-a6kn.onrender.com'
];

const corsOrigin = config.get('CORS_ORIGIN') as string;
const allowedOrigins = [
    ...defaultOrigins,
    ...(corsOrigin ? corsOrigin.split(',').map(origin => origin.trim()) : [])
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
const morganFormat = config.isDevelopment() ? 'dev' : 'combined';
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message: string) => logger.http(message.trim()),
        },
    })
);

// API routes
console.log('Mounting API Routes...');
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'WealthMax API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND',
            path: req.originalUrl,
            method: req.method
        },
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
