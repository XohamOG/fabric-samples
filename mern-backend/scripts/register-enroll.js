const { Wallets, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

// Define paths
const walletPath = path.join(__dirname, '../wallets/org1-wallet');
const ccpPath = path.resolve(__dirname, '../connection-profiles/connection-profile-org1.json');

async function enrollUser() {
    try {
        // Create a wallet for managing identities
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Load the connection profile for Org1
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Check if the user already exists in the wallet
        const userExists = await wallet.get('user1');
        if (userExists) {
            console.log('User "user1" already exists in the wallet');
            return;
        }

        // Get the CA client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caClient = new FabricCAServices(caInfo.url);

        // The enrollment secret for user1 should be known, assuming it's the default one or provided.
        const secret = 'user1pw'; // Replace with the actual secret for user1, if different

        // Enroll the user with the known secret
        const enrollment = await caClient.enroll({
            enrollmentID: 'user1',
            enrollmentSecret: secret,
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

        // Add the identity to the wallet
        await wallet.put('user1', x509Identity);

        console.log('Successfully enrolled user "user1" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll user "user1": ${error}`);
    }
}

enrollUser();
