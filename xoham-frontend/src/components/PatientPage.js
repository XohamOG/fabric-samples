import React, { useState } from 'react';
import axios from 'axios';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import QRCodeScanner from './QRCodeScanner'; // Import QRCodeScanner
import './PatientPage.css';  // Import the CSS file

const PatientPage = () => {
    const [patientId, setPatientId] = useState('');
    const [patientData, setPatientData] = useState({
        patientId: '', name: '', age: '', gender: '',
        address: '', contact: '', medicalHistory: ''
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [scanning, setScanning] = useState(false);  // To toggle QR code scanner

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

    const handleScan = (data) => {
        if (data) {
            setPatientId(data);  // Set the scanned ID
            setScanning(false);   // Close the QR code scanner
            fetchPatientData();  // Fetch patient data based on the scanned ID
        }
    };

    return (
        <div className="patient-page-container">
            <h1 className="patient-page-title">Patient Panel</h1>

            <div className="spline-container">
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

            <div className="bg-white shadow-2xl rounded-lg p-8 w-full sm:w-96 space-y-6">
                {/* Display QR code scanner or input field */}
                {scanning ? (
                    <QRCodeScanner onScan={handleScan} /> // QR Code Scanner
                ) : (
                    <div>
                        <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            placeholder="Enter Patient ID"
                            className="input-field"
                        />
                        <motion.button
                            className="fetch-btn"
                            onClick={fetchPatientData}
                            whileHover={{ scale: 1.05 }}
                        >
                            Fetch Patient Data
                        </motion.button>
                        <motion.button
                            className="scan-btn"
                            onClick={() => setScanning(true)}  // Enable QR code scanner
                            whileHover={{ scale: 1.05 }}
                        >
                            Scan Patient ID
                        </motion.button>
                    </div>
                )}
            </div>

            {responseMessage && (
                <motion.div 
                    className="response-message"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="font-bold">Response Message</h3>
                    <p>{responseMessage}</p>
                </motion.div>
            )}

            {patientData.patientId && (
                <motion.div
                    className="patient-data-container"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
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
                </motion.div>
            )}
        </div>
    );
};

export default PatientPage;
