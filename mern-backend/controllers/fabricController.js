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

        // Check if record exists before creating a hospital record
        if (fcn === 'CreateHospitalRecord') {
            const recordId = args[0];
            try {
                const existingRecord = await contract.evaluateTransaction('ReadHospitalRecord', recordId);
                if (existingRecord.length > 0) {
                    return res.status(400).json({ success: false, error: `Record ${recordId} already exists` });
                }
            } catch (err) {
                console.log('Record does not exist, proceeding to create it.');
            }
        }

        // Check if record exists before creating an insurance record
        if (fcn === 'CreateInsuranceRecord') {
            const recordId = args[0];
            try {
                const existingRecord = await contract.evaluateTransaction('ReadInsuranceRecord', recordId);
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

// Function to query transaction based on role and channels
exports.queryTransaction = async (req, res) => {
    try {
        const { role, patientId } = req.params;

        let org, hospitalChannel, insuranceChannel, contractName, hospitalQueryFcn, insuranceQueryFcn;
        let hospitalRecord, insuranceRecord;

        // Determine channels and functions based on the role
        if (role === 'hospital') {
            org = 'org1';  // Hospital organization
            hospitalChannel = 'hospitalpatient';  // Hospital channel for hospital records
            contractName = 'basic';  // Assuming contract name is the same
            hospitalQueryFcn = 'ReadHospitalRecord';  // Function to query hospital records
        } else if (role === 'insurance') {
            org = 'org2';  // Insurance organization
            insuranceChannel = 'insurancepatient';  // Insurance channel for insurance records
            contractName = 'basic';  // Assuming contract name is the same
            insuranceQueryFcn = 'ReadInsuranceRecord';  // Function to query insurance records
        } else if (role === 'patient') {
            org = 'org3';  // Patient organization
            hospitalChannel = 'hospitalpatient';  // Hospital channel for hospital records
            insuranceChannel = 'insurancepatient';  // Insurance channel for insurance records
            contractName = 'basic';  // Assuming contract name is the same
            hospitalQueryFcn = 'ReadHospitalRecord';  // Function to query hospital records
            insuranceQueryFcn = 'ReadInsuranceRecord';  // Function to query insurance records
        } else {
            return res.status(400).json({ success: false, error: 'Invalid role for this endpoint' });
        }

        // Get connection to the hospital network (if applicable)
        let hospitalGateway, hospitalNetwork;
        if (hospitalChannel) {
            ({ gateway: hospitalGateway, network: hospitalNetwork } = await getFabricConnection(org, hospitalChannel));
            const hospitalContract = hospitalNetwork.getContract(contractName);

            // Query the hospital patient record
            try {
                hospitalRecord = await hospitalContract.evaluateTransaction(hospitalQueryFcn, patientId);
            } catch (err) {
                hospitalRecord = null;  // If no record found, set to null
            }
        }

        // Get connection to the insurance network (if applicable)
        let insuranceGateway, insuranceNetwork;
        if (insuranceChannel) {
            ({ gateway: insuranceGateway, network: insuranceNetwork } = await getFabricConnection(org, insuranceChannel));
            const insuranceContract = insuranceNetwork.getContract(contractName);

            // Query the insurance patient record
            try {
                insuranceRecord = await insuranceContract.evaluateTransaction(insuranceQueryFcn, patientId);
            } catch (err) {
                insuranceRecord = null;  // If no record found, set to null
            }
        }

        // Disconnect from the networks
        if (hospitalGateway) await hospitalGateway.disconnect();
        if (insuranceGateway) await insuranceGateway.disconnect();

        // Combine records and return as response
        const response = {};

        if (hospitalRecord) {
            response.hospitalRecord = JSON.parse(hospitalRecord.toString());
        }

        if (insuranceRecord) {
            response.insuranceRecord = JSON.parse(insuranceRecord.toString());
        }

        // If no records are found, return an error
        if (!hospitalRecord && !insuranceRecord) {
            return res.status(404).json({ success: false, error: 'Patient record not found in hospital and insurance channels' });
        }

        res.status(200).json({ success: true, result: response });

    } catch (error) {
        console.error('Error querying record:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
