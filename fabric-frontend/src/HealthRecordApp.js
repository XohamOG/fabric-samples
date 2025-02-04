import React, { useState } from 'react';
import axios from 'axios';

const HealthRecordApp = () => {
    const [role, setRole] = useState('');
    const [patientId, setPatientId] = useState('');
    const [patientData, setPatientData] = useState({
        id: '', name: '', gender: '', bloodType: '',
        allergies: '', diagnosis: '', treatment: '',
        insuranceDetails: '{}'
    });
    const [records, setRecords] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
    };

    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);
        setRecords([]);
        setResponseMessage('');
        setPatientId('');  // Clear patient ID when changing role
    };

    const fetchRecords = async () => {
        if (!patientId) {
            setResponseMessage('Please enter a valid patient ID');
            return;
        }
        
        try {
            const endpoint = role === 'insurance'
                ? `http://localhost:5000/api/fabric/query/insurance/${patientId}`
                : `http://localhost:5000/api/fabric/query/patient/${patientId}`;

            const response = await axios.get(endpoint);
            if (response.data) {
                setRecords([response.data]); // Assuming response is a single record, adjust as needed
            } else {
                setResponseMessage('No records found');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            setResponseMessage('Error fetching records');
        }
    };

    const CreateRecord = async () => {
        try {
            // Prepare the data for the transaction
            const { id, name, gender, bloodType, allergies, diagnosis, treatment, insuranceDetails } = patientData;
    
            const args = [id, name, gender, bloodType, allergies, diagnosis, treatment, insuranceDetails]; // Modify as needed
            const data = {
                org: 'org1',  // Your organization name
                channel: 'hospitalpatient',  // Your channel name
                contractName: 'basic',  // Your contract name
                fcn: 'CreateRecord',  // Function name in your chaincode to create a record
                args,  // Arguments for the function
            };
    
            // Send the POST request to invoke the transaction
            const response = await axios.post('http://localhost:5000/api/fabric/invoke', data);
            setResponseMessage('Record created successfully');
            
            // Reset form after successful creation
            setPatientData({
                id: '', name: '', gender: '', bloodType: '',
                allergies: '', diagnosis: '', treatment: '',
                insuranceDetails: '{}',
            });
        } catch (error) {
            console.error('Error creating record:', error);
            setResponseMessage('Error creating record');
        }
    };

    const updateRecord = async () => {
        if (!patientData.id) {
            setResponseMessage('Please provide a valid Patient ID to update');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/fabric/update/patient/${patientData.id}`, patientData);
            setResponseMessage('Record updated successfully');
        } catch (error) {
            console.error('Error updating record:', error);
            setResponseMessage('Error updating record');
        }
    };

    const deleteRecord = async () => {
        if (!patientId) {
            setResponseMessage('Please provide a valid Patient ID to delete');
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:5000/api/fabric/delete/patient/${patientId}`);
            setResponseMessage('Record deleted successfully');
            setRecords([]);
        } catch (error) {
            console.error('Error deleting record:', error);
            setResponseMessage('Error deleting record');
        }
    };

    return (
        <div>
            <h1>EHR System</h1>
            <div>
                <button onClick={() => handleRoleSelection('hospital')}>Hospital</button>
                <button onClick={() => handleRoleSelection('patient')}>Patient</button>
                <button onClick={() => handleRoleSelection('insurance')}>Insurance</button>
            </div>

            {role === 'hospital' && (
                <div>
                    <h2>Hospital Panel - Create or Update Record</h2>
                    <input
                        type="text"
                        name="id"
                        value={patientData.id}
                        onChange={handleInputChange}
                        placeholder="Enter Patient ID"
                    />
                    <input
                        type="text"
                        name="name"
                        value={patientData.name}
                        onChange={handleInputChange}
                        placeholder="Enter Patient Name"
                    />
                    <input
                        type="text"
                        name="gender"
                        value={patientData.gender}
                        onChange={handleInputChange}
                        placeholder="Enter Gender"
                    />
                    <input
                        type="text"
                        name="bloodType"
                        value={patientData.bloodType}
                        onChange={handleInputChange}
                        placeholder="Enter Blood Type"
                    />
                    <input
                        type="text"
                        name="allergies"
                        value={patientData.allergies}
                        onChange={handleInputChange}
                        placeholder="Enter Allergies"
                    />
                    <input
                        type="text"
                        name="diagnosis"
                        value={patientData.diagnosis}
                        onChange={handleInputChange}
                        placeholder="Enter Diagnosis"
                    />
                    <input
                        type="text"
                        name="treatment"
                        value={patientData.treatment}
                        onChange={handleInputChange}
                        placeholder="Enter Treatment"
                    />
                    <textarea
                        name="insuranceDetails"
                        value={patientData.insuranceDetails}
                        onChange={handleInputChange}
                        placeholder="Enter Insurance Details"
                    />
                    <button onClick={CreateRecord}>Create Record</button>
                    <button onClick={updateRecord}>Update Record</button>
                </div>
            )}

            {(role === 'patient' || role === 'insurance') && (
                <div>
                    <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Panel</h2>
                    <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="Enter Patient ID"
                    />
                    <button onClick={fetchRecords}>Fetch Records</button>
                    <button onClick={deleteRecord}>Delete Record</button>
                </div>
            )}

            <div>
                <h2>Response Message</h2>
                <p>{responseMessage}</p>
            </div>

            <div>
                <h2>Records</h2>
                <ul>
                    {records.map((record, index) => (
                        <li key={index}>{JSON.stringify(record)}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HealthRecordApp;
