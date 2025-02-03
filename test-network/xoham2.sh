#!/bin/bash

# Function to execute a command and sleep for 5 seconds
execute_with_sleep() {
    echo "Executing: $1"
    eval $1
    sleep 5
}

# Commands to execute
execute_with_sleep "cd .."
execute_with_sleep "cd asset-transfer-basic/chaincode-javascript/"
execute_with_sleep "npm install"
execute_with_sleep "cd ../.."
execute_with_sleep "cd test-network"
execute_with_sleep "export PATH=${PWD}/../bin:$PATH"
execute_with_sleep "export FABRIC_CFG_PATH=$PWD/../config/"
execute_with_sleep "peer lifecycle chaincode package basic.tar.gz --path ../asset-transfer-basic/chaincode-javascript/ --lang node --label basic_1.0"

execute_with_sleep "export CORE_PEER_TLS_ENABLED=true"
execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org1MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:7051"
execute_with_sleep "peer lifecycle chaincode install basic.tar.gz"

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org2MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:9051"
execute_with_sleep "peer lifecycle chaincode install basic.tar.gz"

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org3MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:11051"
execute_with_sleep "peer lifecycle chaincode install basic.tar.gz"

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org2MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:9051"

execute_with_sleep "peer lifecycle chaincode queryinstalled"
execute_with_sleep "export CC_PACKAGE_ID=basic_1.0:5a6883c88759b26c47770551071f59cf22fa98fb5f57c885433160d42b6b4ead"

execute_with_sleep "peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID hospitalpatient --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\""

execute_with_sleep "peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID insurancepatient --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\""

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org1MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:7051"

execute_with_sleep "peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID hospitalpatient --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\""

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org3MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:11051"
execute_with_sleep "peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID insurancepatient --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\""

execute_with_sleep "peer lifecycle chaincode checkcommitreadiness --channelID insurancepatient --name basic --version 1.0 --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\" --output json"

execute_with_sleep "peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID insurancepatient --name basic --version 1.0 --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\" --peerAddresses localhost:11051 --tlsRootCertFiles \"${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt\" --peerAddresses localhost:9051 --tlsRootCertFiles \"${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt\""

execute_with_sleep "peer lifecycle chaincode querycommitted --channelID insurancepatient --name basic --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\""

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org2MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:9051"

execute_with_sleep "peer lifecycle chaincode checkcommitreadiness --channelID hospitalpatient --name basic --version 1.0 --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\" --output json"

execute_with_sleep "peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID hospitalpatient --name basic --version 1.0 --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\" --peerAddresses localhost:7051 --tlsRootCertFiles \"${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt\" --peerAddresses localhost:9051 --tlsRootCertFiles \"${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt\""

execute_with_sleep "peer lifecycle chaincode querycommitted --channelID hospitalpatient --name basic --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\""

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org1MSP\""
execute_with_sleep "export CORE_PEER_TLS_ENABLED=true"
execute_with_sleep "export CORE_PEER_TLS_CERT_FILE=$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/tls/client.crt"
execute_with_sleep "export CORE_PEER_TLS_KEY_FILE=$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/tls/client.key"
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=$PWD/organizations/peerOrganizations/org1.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=$PWD/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:7051"

execute_with_sleep "export CORE_PEER_LOCALMSPID=\"Org2MSP\""
execute_with_sleep "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
execute_with_sleep "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
execute_with_sleep "export CORE_PEER_ADDRESS=localhost:9051"

echo "All commands executed successfully!"