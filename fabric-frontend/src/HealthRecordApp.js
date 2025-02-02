import React, { useState } from 'react';
import axios from 'axios';

const HealthRecordApp = () => {
    const [patientData, setPatientData] = useState({
        id: '',
        name: '',
        gender: '',
        bloodType: '',
        allergies: '',
        diagnosis: '',
        treatment: '',
        insuranceDetails: '{}',
    });

    const [records, setRecords] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
    };

    const handleCreateRecord = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/fabric/invoke', {
                org: 'org1',
                channel: 'hospitalpatient',
                contractName: 'basic',
                fcn: 'CreateRecord',
                args: [
                    patientData.id,
                    patientData.name,
                    patientData.gender,
                    patientData.bloodType,
                    patientData.allergies,
                    patientData.diagnosis,
                    patientData.treatment,
                    patientData.insuranceDetails, // Ensure this is a valid JSON string
                ],
            });

            // If successful, show the result
            setResponseMessage(`Success! Created record: ${JSON.stringify(response.data.result)}`);
        } catch (error) {
            console.error('Error creating record:', error);
            setResponseMessage('Error creating record');
        }
    };

    const fetchRecords = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/fabric/query');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    return (
        <div>
            <h1>Health Record Management</h1>
            <input
                type="text"
                name="id"
                value={patientData.id}
                onChange={handleInputChange}
                placeholder="Patient ID"
            />
            <input
                type="text"
                name="name"
                value={patientData.name}
                onChange={handleInputChange}
                placeholder="Patient Name"
            />
            <input
                type="text"
                name="gender"
                value={patientData.gender}
                onChange={handleInputChange}
                placeholder="Gender"
            />
            <input
                type="text"
                name="bloodType"
                value={patientData.bloodType}
                onChange={handleInputChange}
                placeholder="Blood Type"
            />
            <input
                type="text"
                name="allergies"
                value={patientData.allergies}
                onChange={handleInputChange}
                placeholder="Allergies"
            />
            <input
                type="text"
                name="diagnosis"
                value={patientData.diagnosis}
                onChange={handleInputChange}
                placeholder="Diagnosis"
            />
            <input
                type="text"
                name="treatment"
                value={patientData.treatment}
                onChange={handleInputChange}
                placeholder="Treatment"
            />
            <textarea
                name="insuranceDetails"
                value={patientData.insuranceDetails}
                onChange={handleInputChange}
                placeholder="Insurance Details (JSON format)"
            />
            <button onClick={handleCreateRecord}>Create Record</button>
            <button onClick={fetchRecords}>Fetch Records</button>
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
