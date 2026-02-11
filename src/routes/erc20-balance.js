const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { EthMainnet } = require('../config/constant');

/**
 * @route    GET /api/erc20-balance
 * @desc     Fetches balance of a specific user wallet for a specific ERC20 contract
 * @param    {string} contract - ERC20 contract address (query param)
 * @param    {string} account - User wallet address (query param)
 * @access   public
 */
router.get('/', async (req, res, next) => {
  try {
    const { contract: contractAddress, account: walletAddress } = req.query;

    if (!contractAddress || !walletAddress) {
      const error = new Error(
        "Missing query parameters: 'contract' and 'account' are required.",
      );
      error.status = 400;
      throw error;
    }

    if (
      !ethers.isAddress(contractAddress) ||
      !ethers.isAddress(walletAddress)
    ) {
      const error = new Error('Invalid Ethereum address provided.');
      error.status = 400;
      throw error;
    }

    const provider = new ethers.JsonRpcProvider(EthMainnet);

    const erc20BasicABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function name() view returns (string)',
    ];

    const contract = new ethers.Contract(
      contractAddress,
      erc20BasicABI,
      provider,
    );

    const [name, symbol, decimals, balance] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(walletAddress),
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);

    const result = {
      tokenName: name,
      symbol: symbol,
      wallet: walletAddress,
      contract: contractAddress,
      balance: formattedBalance,
    };

    console.log(`\n--- New Balance Query ---`);
    console.log(`Token: ${result.tokenName} (${result.symbol})`);
    console.log(`Wallet: ${result.wallet}`);
    console.log(`Balance: ${result.balance} ${result.symbol}`);
    console.log(`-------------------------\n`);

    res.json(result);
  } catch (err) {
    console.error('Contract Query Error:', err.message);

    const statusCode = err.status || 500;

    res.status(statusCode).json({
      error: 'Internal Server Error',
      message: err.message,
      code: statusCode,
    });
  }
});

module.exports = router;
