const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const yaml = require('js-yaml');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Utility function to get Fabric connection
async function getFabricConnection(org) {
    try {
        const walletPath = path.resolve(__dirname, 'wallets', `${org}-wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();

        const networkConfigPath = path.resolve(__dirname, 'connection-profile.yaml');
        const networkConfig = yaml.load(fs.readFileSync(networkConfigPath, 'utf8'));

        await gateway.connect(networkConfig, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: true },
        });

        return { gateway, network: await gateway.getNetwork('hospitalpatient') };
    } catch (error) {
        throw new Error(`Failed to connect to Fabric network: ${error.message}`);
    }
}

// Route for invoking transactions (creating/updating records)
app.post('/api/fabric/invoke', async (req, res) => {
    try {
        const { org, contractName, fcn, args } = req.body;

        if (!org || !contractName || !fcn || !Array.isArray(args)) {
            return res.status(400).json({ success: false, error: 'Missing or invalid required fields' });
        }

        console.log(`Invoking transaction: ${fcn} on contract ${contractName} with args:`, args);

        const { gateway, network } = await getFabricConnection(org);
        const contract = network.getContract(contractName);

        const result = await contract.submitTransaction(fcn, ...args);
        await gateway.disconnect();

        res.status(200).json({ success: true, result: result.toString() });
    } catch (error) {
        console.error('Error invoking transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route for querying records
app.get('/api/fabric/query/:role/:patientId', async (req, res) => {
    try {
        const { role, patientId } = req.params;
        const org = 'org1';
        const contractName = 'basic';

        if (!patientId) {
            return res.status(400).json({ success: false, error: 'Patient ID is required' });
        }

        console.log(`Querying record for role: ${role}, Patient ID: ${patientId}`);

        const { gateway, network } = await getFabricConnection(org);
        const contract = network.getContract(contractName);

        let result;
        if (role === 'insurance') {
            result = await contract.evaluateTransaction('ReadRecordForInsurance', patientId);
        } else {
            result = await contract.evaluateTransaction('ReadRecordForPatient', patientId);
        }

        await gateway.disconnect();

        res.status(200).json({ success: true, result: JSON.parse(result.toString()) });
    } catch (error) {
        console.error('Error querying record:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
