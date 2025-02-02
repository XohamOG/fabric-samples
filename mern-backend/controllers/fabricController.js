const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Invoke Transaction
// Invoke Transaction with Duplicate Record Check
exports.invokeTransaction = async (req, res) => {
    try {
        const { org, channel, contractName, fcn, args } = req.body;
        const recordId = args[0];  // First argument is the record ID
        
        // Load the connection profile for the specified organization
        const ccpPath = path.resolve(__dirname, `../connection-profiles/connection-profile-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Load the wallet for the organization
        const walletPath = path.resolve(__dirname, `../wallets/org1-wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if the identity exists in the wallet
        const identity = await wallet.get('user1'); // Ensure the correct identity name
        if (!identity) {
            return res.status(500).json({ success: false, error: 'Identity "user1" not found in wallet' });
        }

        // Connect to the gateway using the correct identity
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the specified channel and contract
        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);

        // Check if the record already exists
        const existingRecord = await contract.evaluateTransaction('QueryRecord', recordId);
        if (existingRecord) {
            return res.status(500).json({ success: false, error: `The record ${recordId} already exists` });
        }

        // Submit the transaction to create the record
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

        // Load the connection profile for the specified organization
        const ccpPath = path.resolve(__dirname, `../connection-profiles/connection-profile-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Load the wallet for the organization
        const walletPath = path.resolve(__dirname, `../wallets/org1-wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if the identity exists in the wallet
        const identity = await wallet.get('user1'); // Ensure the correct identity name
        if (!identity) {
            return res.status(500).json({ success: false, error: 'Identity "user1" not found in wallet' });
        }

        // Connect to the gateway using the correct identity
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the specified channel and contract
        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);

        // Evaluate the transaction
        const result = await contract.evaluateTransaction(fcn, ...args);
        res.status(200).json({ success: true, message: result.toString() });

        await gateway.disconnect();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
