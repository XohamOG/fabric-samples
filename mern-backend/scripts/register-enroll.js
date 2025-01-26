const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Define paths
const walletPath = path.join(__dirname, '../wallets/org1-wallet');
const ccpPath = path.resolve(__dirname, '../connection-profiles/connection-profile-org1.json');

async function registerAndEnrollUser() {
    try {
        // Create a wallet for managing identities
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Load the connection profile for Org1
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Log the connection profile to ensure it's correct
        console.log("Connection Profile: ", ccp);

        // Check if the user already exists in the wallet
        const userExists = await wallet.get('user1');
        if (userExists) {
            console.log('User "user1" already exists in the wallet');
            return;
        }

        // Check if the admin user exists in the wallet
        const adminExists = await wallet.get('admin');
        if (!adminExists) {
            console.error('Admin identity does not exist in the wallet. Register the admin first.');
            return;
        }

        // Connect to the gateway as the admin
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client from the gateway
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the new user
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'user1',
            role: 'client'
        }, adminIdentity);

        // Enroll the new user
        const enrollment = await ca.enroll({
            enrollmentID: 'user1',
            enrollmentSecret: secret
        });

        // Create a new identity for the user
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('user1', x509Identity);

        console.log('Successfully registered and enrolled user "user1" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to register and enroll user "user1": ${error}`);
    }
}

registerAndEnrollUser();
