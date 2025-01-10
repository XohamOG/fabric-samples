#!/bin/bash

# Function to handle errors
handle_error() {
  echo "Error occurred at line $1. Exiting."
  exit 1
}

# Trap errors and call handle_error
trap 'handle_error $LINENO' ERR

# Step-by-step execution with logging

echo "Starting network with Certificate Authority..."
./network.sh up -ca
echo "Network started successfully."
sleep 5  # Sleep to ensure the network is fully up before proceeding

echo "Creating channel 'hospitalpatient'..."
./network.sh createChannel -c hospitalpatient
echo "Channel 'hospitalpatient' created successfully."
sleep 5  # Sleep to ensure channel creation is complete

cd addOrg3 || exit

echo "Generating crypto material for Org3..."
../../bin/cryptogen generate --config=org3-crypto.yaml --output="../organizations"
echo "Crypto material for Org3 generated successfully."
sleep 3  # Sleep to allow for the generation process to complete

export FABRIC_CFG_PATH=$PWD
echo "Generating Org3 configuration..."
../../bin/configtxgen -printOrg Org3MSP > ../organizations/peerOrganizations/org3.example.com/org3.json
echo "Org3 configuration generated successfully."
sleep 3  # Sleep to ensure the config generation completes

export DOCKER_SOCK=/var/run/docker.sock
echo "Starting Org3 containers..."
docker-compose -f compose/compose-org3.yaml -f compose/docker/docker-compose-org3.yaml up -d
echo "Org3 containers started successfully."
sleep 10  # Sleep to allow the containers to start

export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

cd .. || exit

cd configtx/ || exit
export FABRIC_CFG_PATH=$PWD
cd .. || exit

echo "Generating channel block for 'insurancepatient'..."
configtxgen -profile NewChannelProfile -outputBlock ./channel-artifacts/insurancepatient.block -channelID insurancepatient
echo "Channel block for 'insurancepatient' generated successfully."


sleep 5  # Sleep to allow for channel block generation

export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key

echo "Joining orderer to 'insurancepatient' channel..."
osnadmin channel join --channelID insurancepatient --config-block ./channel-artifacts/insurancepatient.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY"
echo "Orderer joined 'insurancepatient' channel successfully."
sleep 5  # Sleep to ensure the orderer joins the channel

echo "Listing channels on orderer..."
osnadmin channel list -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY"
sleep 3  # Sleep to allow for channel listing to complete

echo "Joining Org2 peer to 'insurancepatient' channel..."
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
export FABRIC_CFG_PATH=$PWD/../config/
peer channel join -b ./channel-artifacts/insurancepatient.block
echo "Org2 peer joined 'insurancepatient' channel successfully."
sleep 5  # Sleep to ensure Org2 peer has joined the channel

export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:11051

peer channel join -b ./channel-artifacts/insurancepatient.block
echo "Org3 peer joined 'insurancepatient' channel successfully."
sleep 5  # Sleep to ensure Org3 peer has joined the channel

# Fetch, decode, and update channel configurations for Org2 and Org3 anchor peers
# Steps for Org2 anchor peer
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer channel fetch config channel-artifacts/insurancechannel_config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c insurancepatient --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
sleep 3  # Sleep to allow fetching config to complete

cd channel-artifacts

configtxlator proto_decode --input insurancechannel_config_block.pb --type common.Block --output insurancechannel_config_block.json
jq '.data.data[0].payload.data.config' insurancechannel_config_block.json > insurancechannel_config.json
sleep 3  # Sleep to ensure decoding and JSON extraction completes

cp insurancechannel_config.json insurancechannel_config_copy.json

jq '.channel_group.groups.Application.groups.Org2MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org2.example.com","port": 9051}]},"version": "0"}}' insurancechannel_config_copy.json > insurancechannel_modified_config.json
sleep 3  # Sleep to allow modification to complete

configtxlator proto_encode --input insurancechannel_config.json --type common.Config --output insurancechannel_config.pb
configtxlator proto_encode --input insurancechannel_modified_config.json --type common.Config --output insurancechannel_modified_config.pb
configtxlator compute_update --channel_id insurancepatient --original insurancechannel_config.pb --updated insurancechannel_modified_config.pb --output insurancechannel_config_update.pb
configtxlator proto_decode --input insurancechannel_config_update.pb --type common.ConfigUpdate --output insurancechannel_config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"insurancepatient", "type":2}},"data":{"config_update":'$(cat insurancechannel_config_update.json)'}}}' | jq . > insurancechannel_config_update_in_envelope.json
configtxlator proto_encode --input insurancechannel_config_update_in_envelope.json --type common.Envelope --output insurancechannel_config_update_in_envelope.pb
cd ..
peer channel update -f channel-artifacts/insurancechannel_config_update_in_envelope.pb -c insurancepatient -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
echo "Org2 anchor peer updated successfully."
sleep 5  # Sleep to ensure Org2 anchor peer update is complete


# Steps for Org3 anchor peer
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:11051

peer channel fetch config channel-artifacts/insurancechannel_org3_config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c insurancepatient --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
cd channel-artifacts
configtxlator proto_decode --input insurancechannel_org3_config_block.pb --type common.Block --output insurancechannel_org3_config_block.json
jq '.data.data[0].payload.data.config' insurancechannel_org3_config_block.json > insurancechannel_org3_config.json
cp insurancechannel_org3_config.json insurancechannel_org3_config_copy.json
jq '.channel_group.groups.Application.groups.Org3MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.org3.example.com","port": 11051}]},"version": "0"}}' insurancechannel_org3_config_copy.json > insurancechannel_org3_modified_config.json
configtxlator proto_encode --input insurancechannel_org3_config.json --type common.Config --output insurancechannel_org3_config.pb
configtxlator proto_encode --input insurancechannel_org3_modified_config.json --type common.Config --output insurancechannel_org3_modified_config.pb
configtxlator compute_update --channel_id insurancepatient --original insurancechannel_org3_config.pb --updated insurancechannel_org3_modified_config.pb --output insurancechannel_org3_config_update.pb
configtxlator proto_decode --input insurancechannel_org3_config_update.pb --type common.ConfigUpdate --output insurancechannel_org3_config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"insurancepatient", "type":2}},"data":{"config_update":'$(cat insurancechannel_org3_config_update.json)'}}}' | jq . > insurancechannel_org3_config_update_in_envelope.json
configtxlator proto_encode --input insurancechannel_org3_config_update_in_envelope.json --type common.Envelope --output insurancechannel_org3_config_update_in_envelope.pb
cd ..
peer channel update -f channel-artifacts/insurancechannel_org3_config_update_in_envelope.pb -c insurancepatient -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
peer channel getinfo -c insurancepatient

echo "Fetching channel info for 'insurancepatient'..."
peer channel getinfo -c insurancepatient
echo "Channel info fetched successfully."

echo "Script execution completed successfully."
