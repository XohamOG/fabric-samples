'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    // Initialize ledger with some records
    async InitLedger(ctx) {
        const records = [
            {
                ID: 'hospitalPatient1',
                Name: 'John Doe',
                Gender: 'Male',
                BloodType: 'O+',
                Allergies: 'Peanuts',
                Diagnosis: 'Hypertension',
                Treatment: 'Medication A',
                // No Billing for hospital patients
            },
            {
                ID: 'insurancePatient1',
                Name: 'Jane Smith',
                Billing: {
                    Total: 1500,
                    Paid: 1500,
                    Due: 0,
                },
                Policy: {
                    PolicyNumber: 'INS123456',
                    PolicyName: 'Health Protection Plan',
                    PolicyCompany: 'ABC Insurance Co.',
                    PolicyValidity: '2025-12-31',
                },
            },
        ];

        for (const record of records) {
            record.docType = 'healthRecord';
            await ctx.stub.putState(record.ID, Buffer.from(stringify(sortKeysRecursive(record))));
        }
    }

    // CreateRecord for hospital patients (no billing)
    async CreateHospitalRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment) {
        const exists = await this.RecordExists(ctx, id);
        if (exists) {
            throw new Error(`The record ${id} already exists`);
        }

        const record = {
            ID: id,
            Name: name,
            Gender: gender,
            BloodType: bloodType,
            Allergies: allergies,
            Diagnosis: diagnosis,
            Treatment: treatment,
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        return JSON.stringify(record);
    }

    // CreateRecord for insurance patients (only billing and policy)
    async CreateInsuranceRecord(ctx, id, billing, policy) {
        const exists = await this.RecordExists(ctx, id);
        if (exists) {
            throw new Error(`The record ${id} already exists`);
        }

        const record = {
            ID: id,
            Billing: JSON.parse(billing),
            Policy: JSON.parse(policy),
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        return JSON.stringify(record);
    }

    // Read full health record for hospital patients (without billing)
    async ReadHospitalRecord(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        const record = JSON.parse(recordJSON.toString());
        // Exclude billing info from hospital patient records
        delete record.Billing;
        delete record.Policy;
        return JSON.stringify(record);
    }

    // Read full health record for insurance patients (only billing and policy info)
    async ReadInsuranceRecord(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        const record = JSON.parse(recordJSON.toString());
        // Only return Billing and Policy for insurance patients
        return JSON.stringify({
            ID: record.ID,
            Billing: record.Billing,
            Policy: record.Policy,
        });
    }

    // UpdateRecord for hospital patients (no billing update)
    async UpdateHospitalRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }

        const recordJSON = await this.ReadHospitalRecord(ctx, id);
        const record = JSON.parse(recordJSON);

        record.Name = name;
        record.Gender = gender;
        record.BloodType = bloodType;
        record.Allergies = allergies;
        record.Diagnosis = diagnosis;
        record.Treatment = treatment;
        record.Timestamp = new Date().toISOString();

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        return JSON.stringify(record);
    }

    // UpdateRecord for insurance patients (only billing and policy info)
    async UpdateInsuranceRecord(ctx, id, billing, policy) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }

        const recordJSON = await this.ReadInsuranceRecord(ctx, id);
        const record = JSON.parse(recordJSON);

        record.Billing = JSON.parse(billing);
        record.Policy = JSON.parse(policy);
        record.Timestamp = new Date().toISOString();

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        return JSON.stringify(record);
    }

    // Delete a health record
    async DeleteRecord(ctx, id) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // Check if a record exists
    async RecordExists(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        return recordJSON && recordJSON.length > 0;
    }

    // Get all records
    async GetAllRecords(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
