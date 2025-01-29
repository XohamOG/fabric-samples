const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Invoke Transaction
exports.invokeTransaction = async (req, res) => {
    try {
        const { org, channel, contractName, fcn, args } = req.body;

        const ccpPath = path.resolve(__dirname, `../connection-profiles/connection-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.resolve(__dirname, `../wallet/${org}`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);

        const result = await contract.submitTransaction(fcn, ...args);
        res.status(200).json({ success: true, message: result.toString() });

        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Query Transaction
exports.queryTransaction = async (req, res) => {
    try {
        const { org, channel, contractName, fcn, args } = req.query;

        const ccpPath = path.resolve(__dirname, `../connection-profiles/connection-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.resolve(__dirname, `../wallet/${org}`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);

        const result = await contract.evaluateTransaction(fcn, ...args);
        res.status(200).json({ success: true, message: result.toString() });

        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
