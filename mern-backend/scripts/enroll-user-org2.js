const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function enrollUserOrg2() {
    try {
        // Define Org2 connection profile and wallet path
        const walletPath = path.join(__dirname, '../wallets/org2-wallet');
        const ccpPath = path.resolve(__dirname, '../connection-profiles/connection-profile-org2.json');

        // Create a wallet for managing identities
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Load Org2 connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Check if the user already exists in the wallet
        const userExists = await wallet.get('user2');
        if (userExists) {
            console.log('User "user2" already exists in the wallet');
            return;
        }

        // Get CA client for Org2
        const caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
        const caClient = new FabricCAServices(caInfo.url);

        // Check if the admin exists in the wallet
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('Admin identity for Org2 not found in wallet. Run enrollAdminOrg2.js first.');
            return;
        }

        // Register user2 using the admin identity
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register user2
        const secret = await caClient.register({
            affiliation: 'org2.department1',
            enrollmentID: 'user2',
            role: 'client'
        }, adminUser);

        // Enroll user2
        const enrollment = await caClient.enroll({
            enrollmentID: 'user2',
            enrollmentSecret: secret,
        });

        // Create new identity for user2
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org2MSP',
            type: 'X.509',
        };

        // Add user2 identity to Org2 wallet
        await wallet.put('user2', x509Identity);

        console.log('Successfully enrolled user "user2" for Org2 and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll user "user2" for Org2: ${error}`);
    }
}

enrollUserOrg2();
