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

// Function to set up an event listener for chaincode events
const setupEventListener = async (org, channel, contractName, identity = 'user1') => {
    try {
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

        // Register an event listener
        console.log(`Listening for events on contract: ${contractName}`);
        await contract.addContractListener(async (event) => {
            console.log(`Received event: ${event.eventName}`);
            const eventPayload = event.payload.toString('utf8');
            console.log(`Event Payload: ${eventPayload}`);

            // Here, you can process the event further, like storing in DB, notifying users, etc.
        });
    } catch (error) {
        console.error(`Failed to set up event listener: ${error.message}`);
    }
};

module.exports = { setupEventListener };
