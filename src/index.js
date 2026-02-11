const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

// Middleware
app.use(cors({ origin: `http://localhost:${PORT}` }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/items', require('./routes/items'));
app.use('/api/stats', require('./routes/stats'));

/**
 * @route    GET /api/erc20-balance
 * @desc     Interacts with an Ethereum ERC20 smart contract to fetch name, symbol,
 * decimals, and the balance of a specific wallet address.
 * */
app.use('/api/erc20-balance', require('./routes/erc20-balance.js'));

// Database Connection
require('./config/dbHandler.js').connect();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server on fixed port
app.listen(PORT, () => {
  console.log(`\n🚀 Server booting up...`);
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(
    `📂 RUN: curl -s -X GET "http://localhost:3001/api/erc20-balance?contract=0xdAC17F958D2ee523a2206206994597C13D831ec7&account=0xF977814e90dA44bFA03b6295A0616a897441aceC"`,
  );
});
