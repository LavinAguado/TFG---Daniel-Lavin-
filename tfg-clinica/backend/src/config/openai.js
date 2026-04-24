const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Inicializamos el cliente de OpenAI usando la API Key del entorno
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key', // prevent crash on load if missing
});

module.exports = openai;
