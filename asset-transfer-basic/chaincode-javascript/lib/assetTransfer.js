'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    
    async InitLedger(ctx) {
        const records = [
            {
                ID: 'hospitalPatient_1',
                Name: 'John Doe',
                Gender: 'Male',
                BloodType: 'O+',
                Allergies: 'Peanuts',
                Diagnosis: 'Hypertension',
                Treatment: 'Medication A',
                Timestamp: new Date().toISOString(),
            },
            {
                ID: 'insurancePatient_1',
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
                Timestamp: new Date().toISOString(),
            },
        ];

        for (const record of records) {
            record.docType = 'healthRecord';
            await ctx.stub.putState(record.ID, Buffer.from(stringify(sortKeysRecursive(record))));
        }
    }

    async CreateHospitalRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment) {
        const recordID = `hospitalPatient_${id}`;
        if (await this.RecordExists(ctx, recordID)) {
            throw new Error(`The record ${id} already exists`);
        }

        const record = {
            ID: recordID,
            Name: name,
            Gender: gender,
            BloodType: bloodType,
            Allergies: allergies,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(recordID, Buffer.from(stringify(sortKeysRecursive(record))));
        return JSON.stringify(record);
    }

    async CreateInsuranceRecord(ctx, id, billing, policy) {
        const recordID = `insurancePatient_${id}`;
        if (await this.RecordExists(ctx, recordID)) {
            throw new Error(`The record ${id} already exists`);
        }

        const record = {
            ID: recordID,
            Billing: JSON.parse(billing),
            Policy: JSON.parse(policy),
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(recordID, Buffer.from(stringify(sortKeysRecursive(record))));
        return JSON.stringify(record);
    }

    async ReadHospitalRecord(ctx, id) {
        return this._readRecord(ctx, `hospitalPatient_${id}`);
    }

    async ReadInsuranceRecord(ctx, id) {
        return this._readRecord(ctx, `insurancePatient_${id}`);
    }

    async UpdateHospitalRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment) {
        const recordID = `hospitalPatient_${id}`;
        if (!(await this.RecordExists(ctx, recordID))) {
            throw new Error(`The record ${id} does not exist`);
        }

        const updatedRecord = {
            ID: recordID,
            Name: name,
            Gender: gender,
            BloodType: bloodType,
            Allergies: allergies,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(recordID, Buffer.from(stringify(sortKeysRecursive(updatedRecord))));
        return JSON.stringify(updatedRecord);
    }

    async UpdateInsuranceRecord(ctx, id, billing, policy) {
        const recordID = `insurancePatient_${id}`;
        if (!(await this.RecordExists(ctx, recordID))) {
            throw new Error(`The record ${id} does not exist`);
        }

        const updatedRecord = {
            ID: recordID,
            Billing: JSON.parse(billing),
            Policy: JSON.parse(policy),
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(recordID, Buffer.from(stringify(sortKeysRecursive(updatedRecord))));
        return JSON.stringify(updatedRecord);
    }

    async DeleteRecord(ctx, id) {
        if (!(await this.RecordExists(ctx, id))) {
            throw new Error(`The record ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    async RecordExists(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        return recordJSON && recordJSON.length > 0;
    }

    async GetAllRecords(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');

        for await (const result of iterator) {
            try {
                allResults.push(JSON.parse(result.value.toString('utf8')));
            } catch (err) {
                console.log('Error parsing record:', err);
            }
        }

        return JSON.stringify(allResults);
    }

    async ReadPatientRecord(ctx, id) {
        const hospitalRecord = await this._fetchRecord(ctx, `hospitalPatient_${id}`);
        const insuranceRecord = await this._fetchRecord(ctx, `insurancePatient_${id}`);

        if (!hospitalRecord && !insuranceRecord) {
            throw new Error(`No records found for patient ID ${id}`);
        }

        return JSON.stringify({ hospitalRecord, insuranceRecord });
    }

    async _readRecord(ctx, recordID) {
        const recordJSON = await ctx.stub.getState(recordID);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${recordID} does not exist`);
        }
        return recordJSON.toString();
    }

    async _fetchRecord(ctx, recordID) {
        const recordJSON = await ctx.stub.getState(recordID);
        return recordJSON && recordJSON.length > 0 ? JSON.parse(recordJSON.toString()) : null;
    }
}

module.exports = AssetTransfer;
    