import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http'; // Importamos módulo nativo HTTP
import { connect_db } from './config/db';
import { error_handler } from './middleware/error-handler';
import { AppError } from './utils/app-error';
import { initialize_socket_io } from './socket'; // Importamos nuestro inicializador

// Import routes
import auth_router from './routes/auth-routes';
import payment_router from './routes/payment-routes';
import scholarship_router from './routes/scholarship-routes';
import user_router from './routes/user-routes';
import project_router from './routes/project-routes';
import study_group_router from './routes/study-group-routes';
import appointment_router from './routes/appointment-routes';
import talent_router from './routes/talent-routes';
import admin_scholarship_router from './routes/admin-scholarship-routes';

// Inicializar DB
connect_db();

const app: Application = express();

// Crear servidor HTTP envolviendo a Express
const http_server = createServer(app);

// Inicializar Socket.io adjunto al servidor HTTP
initialize_socket_io(http_server);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Silicity API 🚀 (WebSocket Enabled)',
    });
});

// Rutas de API
app.use('/api/auth', auth_router);
app.use('/api/payment', payment_router);
app.use('/api/scholarships', scholarship_router);
app.use('/api/users', user_router);
app.use('/api/projects', project_router);
app.use('/api/study-groups', study_group_router);
app.use('/api/appointments', appointment_router);
app.use('/api/talents', talent_router);
app.use('/api/admin-scholarships', admin_scholarship_router);

// Middleware para rutas no encontradas (404)
app.all(/(.*)/, (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Middleware Global de Errores
app.use(error_handler);

// Inicializar Servidor usando http_server en lugar de app
const port = process.env.PORT || 5000;
http_server.listen(port, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});

export default app;