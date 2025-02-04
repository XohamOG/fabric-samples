import React, { useState } from 'react';
import axios from 'axios';
import Spline from '@splinetool/react-spline';
import QRCodeScanner from 'react-qr-scanner';

const Hospital = () => {
    const [role] = useState('hospital'); // Fixed as 'hospital'
    const [patientData, setPatientData] = useState({
        id: '', name: '', gender: '', bloodType: '',
        allergies: '', diagnosis: '', treatment: ''
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [scanning, setScanning] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
    };

    const CreateRecord = async () => {
        try {
            const { id, name, gender, bloodType, allergies, diagnosis, treatment } = patientData;
            
            // Adjusted args for hospital records (insurance details removed)
            const args = [id, name, gender, bloodType, allergies, diagnosis, treatment];

            const data = {
                org: 'org1',
                channel: 'hospitalpatient',
                contractName: 'basic',
                fcn: 'CreateHospitalRecord',
                args,
            };

            const response = await axios.post('http://localhost:5000/api/fabric/invoke', data);
            setResponseMessage('Record created successfully');
            setPatientData({
                id: '', name: '', gender: '', bloodType: '',
                allergies: '', diagnosis: '', treatment: ''
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

    const handleScan = (data) => {
        if (data) {
            setPatientData({ ...patientData, id: data });
            setScanning(false);
        }
    };

    const handleError = (err) => {
        console.error(err);
        setResponseMessage('Error scanning QR code');
        setScanning(false);
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen justify-center bg-gray-50">
            <h1 className="text-4xl font-bold mb-6">Hospital Panel</h1>
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
                {scanning ? (
                    <QRCodeScanner
                        delay={300}
                        style={{ width: '100%' }}
                        onScan={handleScan}
                        onError={handleError}
                    />
                ) : (
                    <div>
                        <button
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg mb-6 w-full"
                            onClick={() => setScanning(true)}
                        >
                            Scan QR Code
                        </button>
                        <div className="space-y-6">
                            <input
                                type="text"
                                name="id"
                                value={patientData.id}
                                onChange={handleInputChange}
                                placeholder="Enter Patient ID"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <input
                                type="text"
                                name="name"
                                value={patientData.name}
                                onChange={handleInputChange}
                                placeholder="Enter Patient Name"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <input
                                type="text"
                                name="gender"
                                value={patientData.gender}
                                onChange={handleInputChange}
                                placeholder="Enter Gender"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <input
                                type="text"
                                name="bloodType"
                                value={patientData.bloodType}
                                onChange={handleInputChange}
                                placeholder="Enter Blood Type"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <input
                                type="text"
                                name="allergies"
                                value={patientData.allergies}
                                onChange={handleInputChange}
                                placeholder="Enter Allergies"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <input
                                type="text"
                                name="diagnosis"
                                value={patientData.diagnosis}
                                onChange={handleInputChange}
                                placeholder="Enter Diagnosis"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <input
                                type="text"
                                name="treatment"
                                value={patientData.treatment}
                                onChange={handleInputChange}
                                placeholder="Enter Treatment"
                                className="w-full px-6 py-4 border rounded-lg text-lg"
                            />
                            <div className="space-y-4">
                                <button
                                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg text-lg"
                                    onClick={CreateRecord}
                                >
                                    Create Record
                                </button>
                                <button
                                    className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg text-lg"
                                    onClick={updateRecord}
                                >
                                    Update Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {responseMessage && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full sm:w-96">
                    <h3 className="font-bold">Response Message</h3>
                    <p>{responseMessage}</p>
                </div>
            )}
        </div>
    );
};

export default Hospital;
