import React, { useState } from 'react';
import axios from 'axios';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import './InsurancePage.css';
import QRCodeScanner from './QRCodeScanner'; // Import QRCodeScanner component

const InsurancePage = () => {
    const [insuranceData, setInsuranceData] = useState({
        id: '', name: '', policyNumber: '', coverage: '', validTill: ''
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [step, setStep] = useState(1);
    const [action, setAction] = useState(null);
    const [scanning, setScanning] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInsuranceData({ ...insuranceData, [name]: value });
    };

    const handleScan = (data) => {
        if (data) {
            setInsuranceData({ ...insuranceData, id: data });
            setScanning(false);
            setStep(2);
        }
    };

    const CreateInsuranceRecord = async () => {
        try {
            const { id, name, policyNumber, coverage, validTill } = insuranceData;
            const args = [id, name, policyNumber, coverage, validTill];

            const data = {
                org: 'org3',
                channel: 'insurancechannel',
                contractName: 'basic',
                fcn: 'CreateInsuranceRecord',
                args,
            };

            await axios.post('http://localhost:5000/api/fabric/invoke', data);
            setResponseMessage('Record created successfully');
        } catch (error) {
            console.error('Error creating record:', error);
            setResponseMessage('Error creating record');
        }
    };

    const updateInsuranceRecord = async () => {
        try {
            await axios.put(`http://localhost:5000/api/fabric/update/insurance/${insuranceData.id}`, insuranceData);
            setResponseMessage('Record updated successfully');
        } catch (error) {
            console.error('Error updating record:', error);
            setResponseMessage('Error updating record');
        }
    };

    return (
        <div className="insurance-container">
            {/* Spline Background */}
            <Spline
                scene="https://prod.spline.design/V09Kku2ZzMKZml2Q/scene.splinecode"
                className="spline-bg"
            />

            {/* Overlay Content */}
            <div className="content-overlay">
                <h1 className="title">Insurance Panel</h1>

                {step === 1 && (
                    <motion.div className="step-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h2>Enter or Scan Insurance ID</h2>
                        {scanning ? (
                            <QRCodeScanner onScan={handleScan} /> // Use QRCodeScanner component
                        ) : (
                            <>
                                <motion.button className="btn scan-btn" whileHover={{ scale: 1.05 }} onClick={() => setScanning(true)}>Scan via Webcam</motion.button>
                                <input type="text" name="id" value={insuranceData.id} onChange={handleInputChange} placeholder="Enter Insurance ID" className="input-field" />
                                <motion.button className="btn next-btn" whileHover={{ scale: 1.05 }} onClick={() => setStep(2)}>
                                    Next
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div className="step-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h2>Select Action</h2>
                        <motion.button className="btn create-btn" whileHover={{ scale: 1.05 }} onClick={() => setAction('create')}>
                            Create Record
                        </motion.button>
                        <motion.button className="btn update-btn" whileHover={{ scale: 1.05 }} onClick={() => setAction('update')}>
                            Update Record
                        </motion.button>
                    </motion.div>
                )}

                {action && (
                    <motion.div className="form-container" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
                        <h2>{action === 'create' ? 'Create New Insurance Record' : 'Update Insurance Record'}</h2>
                        {['name', 'policyNumber', 'coverage', 'validTill'].map((field) => (
                            <input
                                key={field}
                                type="text"
                                name={field}
                                value={insuranceData[field]}
                                onChange={handleInputChange}
                                placeholder={`Enter ${field}`}
                                className="input-field"
                            />
                        ))}
                        <motion.button
                            className="btn submit-btn"
                            whileHover={{ scale: 1.05 }}
                            onClick={action === 'create' ? CreateInsuranceRecord : updateInsuranceRecord}
                        >
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

export default InsurancePage;
