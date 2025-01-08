#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

export PATH=${PWD}/../../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}/../../config
export VERBOSE=false

. ../scripts/utils.sh

: ${CONTAINER_CLI:="docker"}
if command -v ${CONTAINER_CLI}-compose > /dev/null 2>&1; then
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI}-compose"}
else
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI} compose"}
fi
infoln "Using ${CONTAINER_CLI} and ${CONTAINER_CLI_COMPOSE}"

# Print the usage message
function printHelp () {
  echo "Usage: "
  echo "  addOrg3.sh up|down|generate [-c <channel name>] [-t <timeout>] [-d <delay>] [-f <docker-compose-file>] [-s <dbtype>]"
  echo "  addOrg3.sh -h|--help (print this message)"
  echo "    <mode> - one of 'up', 'down', or 'generate'"
  echo "      - 'up' - create a new channel and add Org3 to it"
  echo "      - 'down' - bring down the test network and Org3 nodes"
  echo "      - 'generate' - generate required certificates and org definition"
}

# Create crypto material for Org3
function generateOrg3() {
  which cryptogen
  if [ "$?" -ne 0 ]; then
    fatalln "cryptogen tool not found. exiting"
  fi
  infoln "Generating certificates using cryptogen tool"

  infoln "Creating Org3 Identities"
  set -x
  cryptogen generate --config=org3-crypto.yaml --output="../organizations"
  { set +x; } 2>/dev/null
  infoln "Generating CCP files for Org3"
  ./ccp-generate.sh
}

# Generate channel configuration transaction
function generateOrg3Definition() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    fatalln "configtxgen tool not found. exiting"
  fi
  infoln "Generating Org3 organization definition"
  export FABRIC_CFG_PATH=$PWD
  set -x
  configtxgen -printOrg Org3MSP > ../organizations/peerOrganizations/org3.example.com/org3.json
  { set +x; } 2>/dev/null
}

# Create a new channel
function createNewChannel() {
  infoln "Generating channel creation transaction '${CHANNEL_NAME}.tx'"
  set -x
  configtxgen -profile ChannelUsingRaft2 -outputCreateChannelTx ../channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
  { set +x; } 2>/dev/null
  if [ $? -ne 0 ]; then
    fatalln "Failed to generate channel creation transaction..."
  fi

  infoln "Creating channel '${CHANNEL_NAME}'"
  set -x
  peer channel create -o localhost:7050 -c $CHANNEL_NAME -f ../channel-artifacts/${CHANNEL_NAME}.tx --outputBlock ../channel-artifacts/${CHANNEL_NAME}.block --tls --cafile $ORDERER_CA
  { set +x; } 2>/dev/null
  if [ $? -ne 0 ]; then
    fatalln "Failed to create channel..."
  fi
}

# Start Org3 containers
function Org3Up () {
  if [ "${DATABASE}" == "couchdb" ]; then
    ${CONTAINER_CLI_COMPOSE} -f ${COMPOSE_FILE_BASE} -f $COMPOSE_FILE_ORG3 -f ${COMPOSE_FILE_COUCH_BASE} -f $COMPOSE_FILE_COUCH_ORG3 up -d
  else
    ${CONTAINER_CLI_COMPOSE} -f ${COMPOSE_FILE_BASE} -f $COMPOSE_FILE_ORG3 up -d
  fi
}

# Generate the needed certificates, the genesis block and start the network
function addOrg3 () {
  if [ ! -d ../organizations/ordererOrganizations ]; then
    fatalln "ERROR: Please, run ./network.sh up first."
  fi

  if [ ! -d "../organizations/peerOrganizations/org3.example.com" ]; then
    generateOrg3
    generateOrg3Definition
  fi

  infoln "Bringing up Org3 peer"
  Org3Up

  infoln "Creating a new channel '${CHANNEL_NAME}'"
  createNewChannel

  infoln "Joining Org2 and Org3 peers to the new channel"
  docker exec peer0.org2.example.com peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block
  docker exec peer0.org3.example.com peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block
}

# Tear down running network
function networkDown () {
  cd ..
  ./network.sh down
}

# Default values
CRYPTO="cryptogen"
CLI_TIMEOUT=10
CLI_DELAY=3
CHANNEL_NAME="newchannel"
COMPOSE_FILE_BASE=compose/compose-org3.yaml
COMPOSE_FILE_ORG3=compose/${CONTAINER_CLI}/docker-compose-org3.yaml
COMPOSE_FILE_COUCH_BASE=compose/compose-couch-org3.yaml
COMPOSE_FILE_COUCH_ORG3=compose/${CONTAINER_CLI}/docker-compose-couch-org3.yaml
DATABASE="leveldb"

if [[ $# -lt 1 ]] ; then
  printHelp
  exit 0
else
  MODE=$1
  shift
fi

while [[ $# -ge 1 ]] ; do
  key="$1"
  case $key in
  -h )
    printHelp
    exit 0
    ;;
  -c )
    CHANNEL_NAME="$2"
    shift
    ;;
  -t )
    CLI_TIMEOUT="$2"
    shift
    ;;
  -d )
    CLI_DELAY="$2"
    shift
    ;;
  -s )
    DATABASE="$2"
    shift
    ;;
  * )
    errorln "Unknown flag: $key"
    printHelp
    exit 1
    ;;
  esac
  shift
done

if [ "$MODE" == "up" ]; then
  infoln "Creating a new channel '${CHANNEL_NAME}' and adding Org3"
  addOrg3
elif [ "$MODE" == "down" ]; then
  infoln "Stopping network"
  networkDown
elif [ "$MODE" == "generate" ]; then
  infoln "Generating certs and organization definition for Org3"
  generateOrg3
  generateOrg3Definition
else
  printHelp
  exit 1
fi
