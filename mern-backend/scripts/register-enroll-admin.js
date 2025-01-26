const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        // Path to connection profile
        const ccpPath = path.resolve(__dirname, '../connection-profiles/connection-profile-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Set up the wallet to hold identities
        const walletPath = path.join(__dirname, '../wallets/org1-wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if the admin identity already exists in the wallet
        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log('Admin identity already exists in the wallet');
            return;
        }

        // Extract the CA info from the connection profile
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACertsPath = path.resolve(__dirname, '../../test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem');
        const caTLSCACerts = fs.readFileSync(caTLSCACertsPath, 'utf8');

        // Create a CA client
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enroll the admin user
        const enrollment = await ca.enroll({
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw',
        });

        // Create the admin identity
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Add the admin identity to the wallet
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to register and enroll admin user: ${error}`);
        process.exit(1);
    }
}

main();
