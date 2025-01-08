'use strict';

const { Contract } = require('fabric-contract-api');

class HealthRecordContract extends Contract {

    // Initialize the chaincode
    async initLedger(ctx) {
        console.info('Chaincode initialized');
    }

    // Create a new patient record (Hospital only)
    async createPatient(ctx, patientID, name, dob, gender, contact, address, medicalHistory, currentConditions, medications, allergies, immunizations, labResults, treatmentHistory, access) {
        const patientData = {
            id: patientID,
            name: name,
            dob: dob,
            gender: gender,
            contact: contact,
            address: address,
            medicalHistory: medicalHistory,
            currentConditions: currentConditions,
            medications: medications,
            allergies: allergies,
            immunizations: immunizations,
            labResults: labResults,
            treatmentHistory: treatmentHistory,
            access: access // Hospital has access to update this by default
        };

        const patientJSON = JSON.stringify(patientData);
        await ctx.stub.putState(patientID, Buffer.from(patientJSON));
        console.log(`Patient ${patientID} created`);
    }

    // Query a patient by ID (Hospital and Patient can view)
    async queryPatient(ctx, patientID, role) {
        const patientJSON = await ctx.stub.getState(patientID);

        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`Patient with ID ${patientID} does not exist`);
        }

        const patient = JSON.parse(patientJSON.toString());

        // Patient can view their own data
        if (role === 'patient' && patient.id === patientID) {
            return patientJSON.toString();
        }

        // Hospital can view all data
        if (role === 'hospital') {
            return patientJSON.toString();
        }

        // Insurance cannot view full patient data, only billing
        if (role === 'insurance') {
            return JSON.stringify({ billing: patient.billing });
        }

        throw new Error(`Access denied for role: ${role}`);
    }

    // Update patient data (Hospital only)
    async updatePatient(ctx, patientID, name, dob, gender, contact, address, medicalHistory, currentConditions, medications, allergies, immunizations, labResults, treatmentHistory, access) {
        const patientJSON = await ctx.stub.getState(patientID);

        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`Patient with ID ${patientID} does not exist`);
        }

        const patientData = {
            id: patientID,
            name: name || JSON.parse(patientJSON.toString()).name,
            dob: dob || JSON.parse(patientJSON.toString()).dob,
            gender: gender || JSON.parse(patientJSON.toString()).gender,
            contact: contact || JSON.parse(patientJSON.toString()).contact,
            address: address || JSON.parse(patientJSON.toString()).address,
            medicalHistory: medicalHistory || JSON.parse(patientJSON.toString()).medicalHistory,
            currentConditions: currentConditions || JSON.parse(patientJSON.toString()).currentConditions,
            medications: medications || JSON.parse(patientJSON.toString()).medications,
            allergies: allergies || JSON.parse(patientJSON.toString()).allergies,
            immunizations: immunizations || JSON.parse(patientJSON.toString()).immunizations,
            labResults: labResults || JSON.parse(patientJSON.toString()).labResults,
            treatmentHistory: treatmentHistory || JSON.parse(patientJSON.toString()).treatmentHistory,
            access: access || JSON.parse(patientJSON.toString()).access
        };

        await ctx.stub.putState(patientID, Buffer.from(JSON.stringify(patientData)));
        console.log(`Patient ${patientID} updated`);
    }

    // Update billing information (Insurance only)
    async updateBilling(ctx, patientID, billing) {
        const patientJSON = await ctx.stub.getState(patientID);

        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`Patient with ID ${patientID} does not exist`);
        }

        const patientData = JSON.parse(patientJSON.toString());
        patientData.billing = billing;

        await ctx.stub.putState(patientID, Buffer.from(JSON.stringify(patientData)));
        console.log(`Billing for patient ${patientID} updated`);
    }

    // Check access for a specific role (Hospital, Insurance, or Patient)
    async checkAccess(ctx, patientID, role) {
        const patientJSON = await ctx.stub.getState(patientID);

        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`Patient with ID ${patientID} does not exist`);
        }

        const patient = JSON.parse(patientJSON.toString());

        // Check access logic for Hospital, Insurance, and Patient roles
        if (role === 'hospital') {
            return true; // Hospital can access all patient data
        }

        if (role === 'insurance') {
            return patient.billing !== undefined; // Insurance can only access billing data
        }

        if (role === 'patient' && patient.id === patientID) {
            return true; // Patient can access their own data
        }

        return false; // Access denied for any other roles
    }
}

module.exports = HealthRecordContract;
