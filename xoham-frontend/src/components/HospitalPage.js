import React, { useState } from 'react';
import axios from 'axios';
import Spline from '@splinetool/react-spline';
import QRCodeScanner from './QRCodeScanner'; // Import QRCodeScanner
import { motion } from 'framer-motion';
import './Hospital.css';

const Hospital = () => {
    const [patientData, setPatientData] = useState({
        id: '', name: '', gender: '', bloodType: '',
        allergies: '', diagnosis: '', treatment: ''
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [scanning, setScanning] = useState(false);
    const [step, setStep] = useState(1);
    const [action, setAction] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPatientData({ ...patientData, [name]: value });
    };

    const handleScan = (data) => {
        if (data) {
            setPatientData({ ...patientData, id: data });
            setScanning(false);
            setStep(2);
        }
    };

    const CreateRecord = async () => {
        try {
            const { id, name, gender, bloodType, allergies, diagnosis, treatment } = patientData;
            const args = [id, name, gender, bloodType, allergies, diagnosis, treatment];

            const data = {
                org: 'org1',
                channel: 'hospitalpatient',
                contractName: 'basic',
                fcn: 'CreateHospitalRecord',
                args,
            };

            await axios.post('http://localhost:5000/api/fabric/invoke', data);
            setResponseMessage('Record created successfully');
        } catch (error) {
            console.error('Error creating record:', error);
            setResponseMessage('Error creating record');
        }
    };

    const updateRecord = async () => {
        try {
            await axios.put(`http://localhost:5000/api/fabric/update/patient/${patientData.id}`, patientData);
            setResponseMessage('Record updated successfully');
        } catch (error) {
            console.error('Error updating record:', error);
            setResponseMessage('Error updating record');
        }
    };

    return (
        <div className="hospital-container">
            {/* Spline Background */}
            <Spline
                scene="https://prod.spline.design/V09Kku2ZzMKZml2Q/scene.splinecode"
                className="spline-bg"
            />
            

            {/* Overlay Content */}
            <div className="content-overlay">
                <h1 className="title">Hospital Panel</h1>

                {step === 1 && (
                    <motion.div className="step-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h2>Scan QR Code or Enter ID</h2>
                        {scanning ? (
                            <QRCodeScanner onScan={handleScan} /> // Use QRCodeScanner component
                        ) : (
                            <>
                                <motion.button className="btn scan-btn" whileHover={{ scale: 1.05 }} onClick={() => setScanning(true)}>Scan via Webcam</motion.button>
                                <input type="text" name="id" value={patientData.id} onChange={handleInputChange} placeholder="Enter Patient ID" className="input-field" />
                                <motion.button className="btn next-btn" whileHover={{ scale: 1.05 }} onClick={() => setStep(2)}>Next</motion.button>
                            </>
                        )}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div className="step-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h2>Select Action</h2>
                        <motion.button className="btn create-btn" whileHover={{ scale: 1.05 }} onClick={() => setAction('create')}>Create Record</motion.button>
                        <motion.button className="btn update-btn" whileHover={{ scale: 1.05 }} onClick={() => setAction('update')}>Update Record</motion.button>
                    </motion.div>
                )}

                {action && (
                    <motion.div className="form-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h2>{action === 'create' ? 'Create New Record' : 'Update Record'}</h2>
                        {['name', 'gender', 'bloodType', 'allergies', 'diagnosis', 'treatment'].map((field) => (
                            <input key={field} type="text" name={field} value={patientData[field]} onChange={handleInputChange} placeholder={`Enter ${field}`} className="input-field" />
                        ))}
                        <motion.button className="btn submit-btn" whileHover={{ scale: 1.05 }} onClick={action === 'create' ? CreateRecord : updateRecord}>
                            {action === 'create' ? 'Create Record' : 'Update Record'}
                        </motion.button>
                    </motion.div>
                )}

                {responseMessage && (
                    <motion.div className="response-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h3>Response Message</h3>
                        <p>{responseMessage}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Hospital;
