import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connect_db } from './config/db';
import { error_handler } from './middleware/error-handler';
import { AppError } from './utils/app-error';

//Import routes
import auth_router from './routes/auth-routes';
import payment_router from './routes/payment-routes';
import scholarship_router from './routes/scholarship-routes';
import user_router from './routes/user-routes';

// Cargar variables de entorno
dotenv.config();

// Inicializar DB
connect_db();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Silicity API 🚀',
    });
});

app.use('/api/auth', auth_router);
app.use('/api/payment', payment_router);
app.use('/api/scholarships', scholarship_router);
app.use('/api/users', user_router);

// Middleware para rutas no encontradas (404)
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware Global de Errores
app.use(error_handler);

// Inicializar Servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});

export default app;