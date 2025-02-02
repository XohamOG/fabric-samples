const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs'); // To read the YAML file as an object
const cors = require('cors');
const yaml = require('js-yaml');
const app = express();
const port = 5000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON requests

// Define route for invoking a transaction (for creating records)
app.post('/api/fabric/invoke', async (req, res) => {
    const { org, channel, contractName, fcn, args } = req.body;

    try {
        // Set up Fabric network connection
        const walletPath = path.resolve(__dirname, 'wallets', `${org}-wallet`); // Ensure this points to the correct wallet
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();

        // Read the connection profile YAML file and parse it as an object
        const networkConfigPath = path.resolve(__dirname, 'connection-profile.yaml');
        const networkConfig = yaml.load(fs.readFileSync(networkConfigPath, 'utf8')); // Assuming you have 'js-yaml' installed

        // Debug the networkConfig to ensure it's read properly
        console.log("Network Config:", networkConfig);

        // Connect to the Fabric network using the parsed connection profile object
        await gateway.connect(networkConfig, {
            wallet,
            identity: 'admin', // Ensure the identity exists in the wallet
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);

        // Submit the transaction (invoke function)
        const result = await contract.submitTransaction(fcn, ...args);

        // Disconnect the gateway
        await gateway.disconnect();

        // Send the result back to the client
        res.status(200).json({ success: true, result: result.toString() });
    } catch (error) {
        console.error('Error invoking transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Define route for querying records
app.get('/api/fabric/query', async (req, res) => {
    const org = 'org1'; // specify your org here
    const channel = 'hospitalpatient'; // specify your channel name
    const contractName = 'basic'; // specify your contract name

    try {
        // Set up Fabric network connection
        const walletPath = path.resolve(__dirname, 'wallets', `${org}-wallet`); // Ensure this points to the correct wallet
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();

        // Read the connection profile YAML file and parse it as an object
        const networkConfigPath = path.resolve(__dirname, 'connection-profile.yaml');
        const networkConfig = yaml.load(fs.readFileSync(networkConfigPath, 'utf8')); // Assuming you have 'js-yaml' installed

        // Connect to the Fabric network using the parsed connection profile object
        await gateway.connect(networkConfig, {
            wallet,
            identity: 'admin', // Ensure the identity exists in the wallet
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);

        // Query the chaincode (for fetching records)
        const result = await contract.evaluateTransaction('GetAllRecords');
        console.log(`Query Result: ${result.toString()}`);

        // Optionally, parse the result if it's JSON
        const records = JSON.parse(result.toString());
        res.status(200).json(records);

        // Disconnect the gateway
        await gateway.disconnect();
    } catch (error) {
        console.error('Error querying records:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
