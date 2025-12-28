import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { connect_db } from './config/db';
import { error_handler } from './middleware/error-handler';
import { AppError } from './utils/app-error';
import { initialize_socket_io } from './socket';

// ============================================
// 📦 IMPORTAR RUTAS
// ============================================
import auth_router from './routes/auth-routes';
import payment_router from './routes/payment-routes';
import scholarship_router from './routes/scholarship-routes';
import user_router from './routes/user-routes';
import project_router from './routes/project-routes';
import study_group_router from './routes/study-group-routes';
import appointment_router from './routes/appointment-routes';
import talent_router from './routes/talent-routes';
import admin_scholarship_router from './routes/admin-scholarship-routes';
import admin_router from './routes/admin-routes';

// ============================================
// 🔧 CONFIGURACIÓN
// ============================================
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

// Validar variable de entorno crítica en producción
if (IS_PRODUCTION && !process.env.CLIENT_URL) {
    console.error('❌ FATAL: CLIENT_URL no está configurado en producción');
    process.exit(1);
}

// ============================================
// 🚀 INICIALIZACIÓN
// ============================================
connect_db();

const app: Application = express();
const http_server = createServer(app);

// Inicializar Socket.io
initialize_socket_io(http_server);

// ============================================
// 🛡️ MIDDLEWARES DE SEGURIDAD
// ============================================

// Rate Limiting Global
const api_limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 peticiones por ventana
    message: {
        status: 'error',
        message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip en desarrollo para no molestar
    skip: () => !IS_PRODUCTION && process.env.SKIP_RATE_LIMIT === 'true'
});

app.use('/api', api_limiter);

// Helmet - Headers de seguridad
app.use(helmet());

// CORS - Un solo origen desde variable de entorno
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser con límite de tamaño
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Morgan - Solo en desarrollo
if (!IS_PRODUCTION) {
    app.use(morgan('dev'));
}

// ============================================
// 🏥 HEALTH CHECK
// ============================================
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Silicity API 🚀',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// ============================================
// 📡 RUTAS DE API
// ============================================
app.use('/api/auth', auth_router);
app.use('/api/payment', payment_router);
app.use('/api/scholarships', scholarship_router);
app.use('/api/users', user_router);
app.use('/api/projects', project_router);
app.use('/api/study-groups', study_group_router);
app.use('/api/appointments', appointment_router);
app.use('/api/talents', talent_router);
app.use('/api/admin-scholarships', admin_scholarship_router);
app.use('/api/admin', admin_router);

// ============================================
// ❌ MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
});

// Error Handler Global
app.use(error_handler);

// ============================================
// 🎬 INICIAR SERVIDOR
// ============================================
http_server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║         🚀 SILICITY API SERVER 🚀          ║
╠════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
║  Port: ${String(PORT).padEnd(34)}║
║  Client URL: ${(process.env.CLIENT_URL || 'http://localhost:5173').substring(0, 28).padEnd(28)}║
╚════════════════════════════════════════════╝
    `);
});

// ============================================
// 🔄 MANEJO DE ERRORES NO CAPTURADOS
// ============================================
process.on('unhandledRejection', (reason: Error) => {
    console.error('💥 UNHANDLED REJECTION:', reason.message);
    if (IS_PRODUCTION) {
        // En producción, cerrar gracefully
        http_server.close(() => {
            process.exit(1);
        });
    }
});

process.on('uncaughtException', (error: Error) => {
    console.error('💥 UNCAUGHT EXCEPTION:', error.message);
    if (IS_PRODUCTION) {
        process.exit(1);
    }
});

export default app;