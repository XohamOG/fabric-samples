const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const yaml = require('js-yaml');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Utility function to get Fabric connection
async function getFabricConnection(org, channel) {
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

        return { gateway, network: await gateway.getNetwork(channel) };
    } catch (error) {
        throw new Error(`Failed to connect to Fabric network: ${error.message}`);
    }
}

// Route for invoking transactions (creating/updating records)
app.post('/api/fabric/invoke', async (req, res) => {
    try {
        const { org, channel, contractName, fcn, args } = req.body;

        if (!org || !channel || !contractName || !fcn || !Array.isArray(args)) {
            return res.status(400).json({ success: false, error: 'Missing or invalid required fields' });
        }

        console.log(`Invoking transaction: ${fcn} on contract ${contractName} with args:`, args);

        const { gateway, network } = await getFabricConnection(org, channel);
        const contract = network.getContract(contractName);

        // Invoke the transaction on the Fabric network
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

        let org, hospitalChannel, insuranceChannel, contractName, hospitalQueryFcn, insuranceQueryFcn;
        let hospitalRecord, insuranceRecord;

        // Logic to handle 'patient' role
        if (role === 'patient') {
            org = 'org2';  // Assuming 'org2' is the patient's org
            hospitalChannel = 'hospitalpatient';  // Hospital channel for hospital records
            insuranceChannel = 'insurancepatient';  // Insurance channel for insurance records
            contractName = 'basic';  // Assuming contract name is the same for both
            hospitalQueryFcn = 'ReadHospitalRecord';  // Function to query hospital records
            insuranceQueryFcn = 'ReadInsuranceRecord';  // Function to query insurance records
        } else {
            return res.status(400).json({ success: false, error: 'Invalid role for this endpoint' });
        }

        console.log(`Querying record for role: ${role}, Patient ID: ${patientId}`);

        // Get connection to the hospital network
        const { gateway: hospitalGateway, network: hospitalNetwork } = await getFabricConnection(org, hospitalChannel);
        const hospitalContract = hospitalNetwork.getContract(contractName);

        // Query the hospital patient record
        try {
            hospitalRecord = await hospitalContract.evaluateTransaction(hospitalQueryFcn, patientId);
        } catch (err) {
            hospitalRecord = null;  // If no record found, set to null
        }

        // Get connection to the insurance network
        const { gateway: insuranceGateway, network: insuranceNetwork } = await getFabricConnection(org, insuranceChannel);
        const insuranceContract = insuranceNetwork.getContract(contractName);

        // Query the insurance patient record
        try {
            insuranceRecord = await insuranceContract.evaluateTransaction(insuranceQueryFcn, patientId);
        } catch (err) {
            insuranceRecord = null;  // If no record found, set to null
        }

        // Disconnect from the networks
        await hospitalGateway.disconnect();
        await insuranceGateway.disconnect();

        // Combine records and return as response
        const response = {};

        if (hospitalRecord) {
            response.hospitalRecord = JSON.parse(hospitalRecord.toString());
        }

        if (insuranceRecord) {
            response.insuranceRecord = JSON.parse(insuranceRecord.toString());
        }

        // If both records are not found, return an error
        if (!hospitalRecord && !insuranceRecord) {
            return res.status(404).json({ success: false, error: 'Patient record not found in hospital and insurance channels' });
        }

        res.status(200).json({ success: true, result: response });

    } catch (error) {
        console.error('Error querying record:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
