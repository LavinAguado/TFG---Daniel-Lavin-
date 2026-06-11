require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  console.log("🔥 Iniciando servidor...");

  try {
    console.log("🔌 Probando conexión a DB...");
    await testConnection();
  } catch (error) {
    console.error("❌ Error al testear DB:", error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer();