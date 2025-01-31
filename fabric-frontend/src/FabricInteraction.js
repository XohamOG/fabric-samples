import React, { useState } from 'react';
import axios from 'axios';

const FabricInteraction = () => {
  const [result, setResult] = useState('');

  // Use this example data or pass dynamic values if required
  const args = ['record9', 'Alice', 'Female', 'B+', 'Dust', 'Cancer', 'Chemo', '{"Total":2000,"Paid":1000,"Due":1000}'];
  
  const handleInvoke = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/fabric/invoke', {
        org: 'org1',
        channel: 'hospitalpatient',
        contractName: 'basic',
        fcn: 'CreateRecord',
        args,
      });
      setResult(response.data.message);
    } catch (error) {
      setResult(error.message);
    }
  };

  const handleQuery = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/fabric/query', {
        params: { org: 'org1', channel: 'hospitalpatient', contractName: 'basic', fcn: 'CreateRecord', args },
      });
      setResult(response.data.message);
    } catch (error) {
      setResult(error.message);
    }
  };

  return (
    <div>
      <h2>Interact with Hyperledger Fabric</h2>
      <div>
        <button onClick={handleInvoke}>Invoke Transaction</button>
        <button onClick={handleQuery}>Query Transaction</button>
      </div>
      <div>
        <h3>Result:</h3>
        <pre>{result}</pre>
      </div>
    </div>
  );
};

export default FabricInteraction;
