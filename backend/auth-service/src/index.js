const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Sequelize } = require('sequelize');

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ message: 'Auth Service is running', db_status: 'Connected' });
  } catch (error) {
    res.status(500).json({ message: 'Auth Service is running', db_status: 'Error', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Auth Service listening at http://localhost:${port}`);
});
