process.env.TZ = 'America/Guayaquil';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { dbConnect } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const surveyRoutes = require('./routes/survey.routes');
const communityRoutes = require('./routes/community.routes');
const publicRoutes = require('./routes/public.routes')
const adminRoutes = require('./routes/admin.routes');
 


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Para JSON grande
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/communities', communityRoutes);

//Para la web
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno del servidor' });
});

// Iniciar servidor
const startServer = async () => {
  await dbConnect();
  // Sincronizar modelos con la BD (sin alterar tablas existentes)
   await require('./models').sequelize.sync({ alter: false });
  app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();