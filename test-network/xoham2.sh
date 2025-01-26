#!/bin/bash

# Function to handle errors
handle_error() {
  echo "Error: $1"
  exit 1
}

# Function to run a command with error handling
run_command() {
  echo "Running: $1"
  eval "$1"
  if [ $? -ne 0 ]; then
    handle_error "$2"
  fi
  sleep 5 # Adding delay between commands
}

# Navigate to chaincode directory
run_command "cd .." "Failed to navigate to parent directory"
run_command "cd asset-transfer-basic/chaincode-javascript/" "Failed to navigate to chaincode-javascript directory"


# Install dependencies
run_command "npm install" "Failed to install npm dependencies"

# Return to test-network directory
run_command "cd ../.." "Failed to return to root directory"
run_command "cd test-network" "Failed to navigate to test-network directory"

# Set environment variables
run_command "export PATH=${PWD}/../bin:$PATH" "Failed to set PATH"
run_command "export FABRIC_CFG_PATH=$PWD/../config/" "Failed to set FABRIC_CFG_PATH"

# Package the chaincode
run_command "peer lifecycle chaincode package basic.tar.gz --path ../asset-transfer-basic/chaincode-javascript/ --lang node --label basic_1.0" "Failed to package chaincode"

# Install chaincode on Org1
run_command "export CORE_PEER_TLS_ENABLED=true" "Failed to set CORE_PEER_TLS_ENABLED"
run_command "export CORE_PEER_LOCALMSPID=\"Org1MSP\"" "Failed to set CORE_PEER_LOCALMSPID for Org1"
run_command "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" "Failed to set CORE_PEER_TLS_ROOTCERT_FILE for Org1"
run_command "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" "Failed to set CORE_PEER_MSPCONFIGPATH for Org1"
run_command "export CORE_PEER_ADDRESS=localhost:7051" "Failed to set CORE_PEER_ADDRESS for Org1"
run_command "peer lifecycle chaincode install basic.tar.gz" "Failed to install chaincode on Org1"

# Install chaincode on Org2
run_command "export CORE_PEER_TLS_ENABLED=true" 
run_command "export CORE_PEER_LOCALMSPID=\"Org2MSP\"" "Failed to set CORE_PEER_LOCALMSPID for Org2"
run_command "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" "Failed to set CORE_PEER_TLS_ROOTCERT_FILE for Org2"
run_command "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp" "Failed to set CORE_PEER_MSPCONFIGPATH for Org2"
run_command "export CORE_PEER_ADDRESS=localhost:9051" "Failed to set CORE_PEER_ADDRESS for Org2"
run_command "peer lifecycle chaincode install basic.tar.gz" "Failed to install chaincode on Org2"

# Install chaincode on Org3
run_command "export CORE_PEER_LOCALMSPID=\"Org3MSP\"" "Failed to set CORE_PEER_LOCALMSPID for Org3"
run_command "export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt" "Failed to set CORE_PEER_TLS_ROOTCERT_FILE for Org3"
run_command "export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp" "Failed to set CORE_PEER_MSPCONFIGPATH for Org3"
run_command "export CORE_PEER_ADDRESS=localhost:11051" "Failed to set CORE_PEER_ADDRESS for Org3"
run_command "peer lifecycle chaincode install basic.tar.gz" "Failed to install chaincode on Org3"

# Query installed chaincode on Org2
run_command "export CORE_PEER_LOCALMSPID=\"Org2MSP\"" "Failed to set CORE_PEER_LOCALMSPID for Org2"
run_command "peer lifecycle chaincode queryinstalled" "Failed to query installed chaincode on Org2"

# Commit chaincode (example for Org3 and Org2 on insurancepatient channel)
run_command "peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID insurancepatient --name basic --version 1.0 --sequence 1 --tls --cafile \"${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem\" --peerAddresses localhost:11051 --tlsRootCertFiles \"${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt\" --peerAddresses localhost:9051 --tlsRootCertFiles \"${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt\"" "Failed to commit chaincode on insurancepatient channel"

# Final message
echo "Script executed successfully!"
