const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Utility function to get Fabric connection profile
const getConnectionProfile = (org) => {
    try {
        const ccpPath = path.resolve(__dirname, `../connection-profiles/connection-profile-${org}.json`);
        return JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    } catch (error) {
        throw new Error(`Failed to load connection profile for ${org}: ${error.message}`);
    }
};

// Utility function to get the wallet
const getWallet = async (org) => {
    const walletPath = path.resolve(__dirname, `../wallets/${org}-wallet`);
    return await Wallets.newFileSystemWallet(walletPath);
};

// Utility function to get Fabric gateway and contract
const getContract = async (org, channel, contractName, identity) => {
    const ccp = getConnectionProfile(org);
    const wallet = await getWallet(org);
    const identityExists = await wallet.get(identity);

    if (!identityExists) {
        throw new Error(`Identity "${identity}" not found in wallet`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity, discovery: { enabled: true, asLocalhost: true } });

    const network = await gateway.getNetwork(channel);
    const contract = network.getContract(contractName);

    return { gateway, contract };
};

// Function to invoke transaction
exports.invokeTransaction = async (req, res) => {
    try {
        const { org, channel, contractName, fcn, args, identity = 'user1' } = req.body;

        const { gateway, contract } = await getContract(org, channel, contractName, identity);

        // Check if record exists before creating it
        if (fcn === 'CreateRecord') {
            const recordId = args[0];
            try {
                const existingRecord = await contract.evaluateTransaction('QueryRecord', recordId);
                if (existingRecord.length > 0) {
                    return res.status(400).json({ success: false, error: `Record ${recordId} already exists` });
                }
            } catch (err) {
                console.log('Record does not exist, proceeding to create it.');
            }
        }

        // Submit the transaction
        const result = await contract.submitTransaction(fcn, ...args);
        await gateway.disconnect();

        res.status(200).json({ success: true, message: result.toString() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Function to query transaction
exports.queryTransaction = async (req, res) => {
    try {
        const { org, channel, contractName, fcn, args, identity = 'user1' } = req.query;

        const { gateway, contract } = await getContract(org, channel, contractName, identity);

        // Query the chaincode with patient ID
        const result = await contract.evaluateTransaction(fcn, ...args); // args should contain the correct parameters (e.g., patientId)

        await gateway.disconnect();

        res.status(200).json({ success: true, data: JSON.parse(result.toString()) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
