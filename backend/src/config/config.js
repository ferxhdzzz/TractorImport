// Configuración de la aplicación
export const config = {
  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'clave_secreta_para_desarrollo_cambiar_en_produccion',
    expiresIn: '24h', // Tiempo de expiración del token
  },
  
  // Configuración de la base de datos
  db: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/tractorimport',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
  },
  
  // Configuración de carga de archivos
  uploads: {
    directory: 'uploads/',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
  }
};

// Configuraciones específicas por entorno
const environmentConfigs = {
  development: {
    // Configuraciones específicas para desarrollo
  },
  production: {
    // Configuraciones específicas para producción
    jwt: {
      secret: process.env.JWT_SECRET, // En producción, esto DEBE estar definido en las variables de entorno
      expiresIn: '1h'
    }
  }
};

// Exportar configuración según el entorno actual
const environment = process.env.NODE_ENV || 'development';
export default {
  ...config,
  ...(environmentConfigs[environment] || {})
};
