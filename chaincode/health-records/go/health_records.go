package main

import (
    "fmt"
    "github.com/hyperledger/fabric-chaincode-go/shim"
    "github.com/hyperledger/fabric-protos-go/peer"
)

type HealthRecordsChaincode struct {
}

// Init initializes the chaincode
func (t *HealthRecordsChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
    return shim.Success(nil)
}

// Invoke routes function calls to the correct handler
func (t *HealthRecordsChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
    function, args := stub.GetFunctionAndParameters()

    if function == "setRecord" {
        return t.setRecord(stub, args)
    } else if function == "getRecord" {
        return t.getRecord(stub, args)
    }

    return shim.Error("Invalid function name")
}

// setRecord sets a health record
func (t *HealthRecordsChaincode) setRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {
    if len(args) != 2 {
        return shim.Error("Incorrect number of arguments. Expecting 2")
    }

    err := stub.PutState(args[0], []byte(args[1]))
    if err != nil {
        return shim.Error(fmt.Sprintf("Failed to set record for %s", args[0]))
    }

    return shim.Success(nil)
}

// getRecord retrieves a health record
func (t *HealthRecordsChaincode) getRecord(stub shim.ChaincodeStubInterface, args []string) peer.Response {
    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting 1")
    }

    value, err := stub.GetState(args[0])
    if err != nil {
        return shim.Error(fmt.Sprintf("Failed to get record for %s", args[0]))
    }

    return shim.Success(value)
}

func main() {
    err := shim.Start(new(HealthRecordsChaincode))
    if err != nil {
        fmt.Printf("Error starting HealthRecordsChaincode: %s", err)
    }
}
