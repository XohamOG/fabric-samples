import React, { useState } from 'react';
import axios from 'axios';
import Spline from '@splinetool/react-spline';

const PatientPage = () => {
    const [patientId, setPatientId] = useState('');
    const [patientData, setPatientData] = useState({
        patientId: '', name: '', age: '', gender: '',
        address: '', contact: '', medicalHistory: ''
    });
    const [responseMessage, setResponseMessage] = useState('');

    const fetchPatientData = async () => {
        if (!patientId) {
            setResponseMessage('Please enter a valid patient ID');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/fabric/query/patient/${patientId}`);
            if (response.data) {
                setPatientData(response.data); // Set the patient data
            } else {
                setResponseMessage('No records found');
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
            setResponseMessage('Error fetching patient data');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen justify-center bg-gray-50">
            <h1 className="text-4xl font-bold mb-6">Patient Panel</h1>

            <div className="relative w-full h-80 mb-6">
                {/* Spline background */}
                <Spline
                    scene="https://prod.spline.design/V09Kku2ZzMKZml2Q/scene.splinecode"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -2,
                    }}
                />
            </div>

            <div className="bg-white shadow-xl rounded-lg p-8 w-full sm:w-96 space-y-6">
                <div>
                    <input
                        type="text"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        placeholder="Enter Patient ID"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <button
                        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg text-lg mt-4"
                        onClick={fetchPatientData}
                    >
                        Fetch Patient Data
                    </button>
                </div>
            </div>

            {responseMessage && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full sm:w-96">
                    <h3 className="font-bold">Response Message</h3>
                    <p>{responseMessage}</p>
                </div>
            )}

            {patientData.patientId && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full sm:w-96">
                    <h3 className="font-bold">Patient Data</h3>
                    <ul className="space-y-2">
                        <li><strong>Patient ID:</strong> {patientData.patientId}</li>
                        <li><strong>Name:</strong> {patientData.name}</li>
                        <li><strong>Age:</strong> {patientData.age}</li>
                        <li><strong>Gender:</strong> {patientData.gender}</li>
                        <li><strong>Address:</strong> {patientData.address}</li>
                        <li><strong>Contact:</strong> {patientData.contact}</li>
                        <li><strong>Medical History:</strong> {patientData.medicalHistory}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PatientPage;
