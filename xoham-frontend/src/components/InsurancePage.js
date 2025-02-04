import React, { useState } from 'react';
import axios from 'axios';
import Spline from '@splinetool/react-spline';

const InsurancePage = () => {
    const [patientId, setPatientId] = useState('');
    const [billingData, setBillingData] = useState({
        patientId: '', billingAmount: '', status: '',
        insuranceCompany: '', policyNumber: '', coverage: ''
    });
    const [responseMessage, setResponseMessage] = useState('');
    const [records, setRecords] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBillingData({ ...billingData, [name]: value });
    };

    const fetchBilling = async () => {
        if (!patientId) {
            setResponseMessage('Please enter a valid patient ID');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/fabric/query/insurance/${patientId}`);
            if (response.data && Array.isArray(response.data)) {
                setRecords(response.data); // Assuming response is an array of records
            } else if (response.data) {
                setRecords([response.data]); // If single record returned, wrap it in an array
            } else {
                setResponseMessage('No records found');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            setResponseMessage('Error fetching records');
        }
    };

    const updateBilling = async () => {
        if (!billingData.patientId || !billingData.billingAmount || !billingData.status) {
            setResponseMessage('Please provide valid Patient ID and Billing Details');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/fabric/update/insurance/${billingData.patientId}`, billingData);
            setResponseMessage('Billing details updated successfully');
        } catch (error) {
            console.error('Error updating billing details:', error);
            setResponseMessage('Error updating billing details');
        }
    };

    return (
        <div className="flex flex-col items-center p-6 min-h-screen justify-center bg-gray-50">
            <h1 className="text-4xl font-bold mb-6">Insurance Panel</h1>

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
                        onClick={fetchBilling}
                    >
                        Fetch Billing Records
                    </button>
                </div>

                <div className="space-y-6">
                    <input
                        type="text"
                        name="patientId"
                        value={billingData.patientId}
                        onChange={handleInputChange}
                        placeholder="Enter Patient ID"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <input
                        type="text"
                        name="billingAmount"
                        value={billingData.billingAmount}
                        onChange={handleInputChange}
                        placeholder="Enter Billing Amount"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <input
                        type="text"
                        name="status"
                        value={billingData.status}
                        onChange={handleInputChange}
                        placeholder="Enter Billing Status"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <input
                        type="text"
                        name="insuranceCompany"
                        value={billingData.insuranceCompany}
                        onChange={handleInputChange}
                        placeholder="Enter Insurance Company"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <input
                        type="text"
                        name="policyNumber"
                        value={billingData.policyNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Policy Number"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <input
                        type="text"
                        name="coverage"
                        value={billingData.coverage}
                        onChange={handleInputChange}
                        placeholder="Enter Coverage Details"
                        className="w-full px-6 py-4 border rounded-lg text-lg"
                    />
                    <div className="space-y-4">
                        <button
                            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg text-lg"
                            onClick={updateBilling}
                        >
                            Update Billing
                        </button>
                    </div>
                </div>
            </div>

            {responseMessage && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full sm:w-96">
                    <h3 className="font-bold">Response Message</h3>
                    <p>{responseMessage}</p>
                </div>
            )}

            {records.length > 0 && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg w-full sm:w-96">
                    <h3 className="font-bold">Billing Records</h3>
                    <ul>
                        {records.map((record, index) => (
                            <li key={index} className="mb-2">
                                <pre>{JSON.stringify(record, null, 2)}</pre>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InsurancePage;
