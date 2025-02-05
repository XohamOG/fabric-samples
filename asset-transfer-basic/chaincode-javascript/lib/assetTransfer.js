'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    
    // Initialize ledger with sample records
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
            },
        ];

        for (const record of records) {
            record.docType = 'healthRecord';
            await ctx.stub.putState(record.ID, Buffer.from(stringify(sortKeysRecursive(record))));
        }
    }

    // Create hospital patient record (no billing)
    async CreateHospitalRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment) {
        const exists = await this.RecordExists(ctx, id);
        if (exists) {
            throw new Error(`The record ${id} already exists`);
        }

        const record = {
            ID: `hospitalPatient_${id}`,
            Name: name,
            Gender: gender,
            BloodType: bloodType,
            Allergies: allergies,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(record.ID, Buffer.from(stringify(sortKeysRecursive(record))));
        return JSON.stringify(record);
    }

    // Create insurance patient record (billing & policy only)
    async CreateInsuranceRecord(ctx, id, billing, policy) {
        const exists = await this.RecordExists(ctx, id);
        if (exists) {
            throw new Error(`The record ${id} already exists`);
        }

        const record = {
            ID: `insurancePatient_${id}`,
            Billing: JSON.parse(billing),
            Policy: JSON.parse(policy),
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(record.ID, Buffer.from(stringify(sortKeysRecursive(record))));
        return JSON.stringify(record);
    }

    // Read hospital patient record
    async ReadHospitalRecord(ctx, id) {
        const recordJSON = await ctx.stub.getState(`hospitalPatient_${id}`);

        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The hospital record for ${id} does not exist`);
        }

        return recordJSON.toString();
    }

    // Read insurance patient record
    async ReadInsuranceRecord(ctx, id) {
        const recordJSON = await ctx.stub.getState(`insurancePatient_${id}`);

        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The insurance record for ${id} does not exist`);
        }

        return recordJSON.toString();
    }

    // Update hospital record (no billing updates)
    async UpdateHospitalRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment) {
        const exists = await this.RecordExists(ctx, `hospitalPatient_${id}`);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }

        const updatedRecord = {
            ID: `hospitalPatient_${id}`,
            Name: name,
            Gender: gender,
            BloodType: bloodType,
            Allergies: allergies,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(updatedRecord.ID, Buffer.from(stringify(sortKeysRecursive(updatedRecord))));
        return JSON.stringify(updatedRecord);
    }

    // Update insurance record (billing & policy only)
    async UpdateInsuranceRecord(ctx, id, billing, policy) {
        const exists = await this.RecordExists(ctx, `insurancePatient_${id}`);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }

        const updatedRecord = {
            ID: `insurancePatient_${id}`,
            Billing: JSON.parse(billing),
            Policy: JSON.parse(policy),
            Timestamp: new Date().toISOString(),
        };

        await ctx.stub.putState(updatedRecord.ID, Buffer.from(stringify(sortKeysRecursive(updatedRecord))));
        return JSON.stringify(updatedRecord);
    }

    // Delete a record
    async DeleteRecord(ctx, id) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    // Check if a record exists
    async RecordExists(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        return recordJSON && recordJSON.length > 0;
    }

    // Fetch all health records
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

    // Fetch complete patient record (hospital + insurance details)
    async ReadPatientRecord(ctx, id) {
        let hospitalRecord = null;
        let insuranceRecord = null;

        // Fetch hospital record
        const hospitalRecordJSON = await ctx.stub.getState(`hospitalPatient_${id}`);
        if (hospitalRecordJSON && hospitalRecordJSON.length > 0) {
            hospitalRecord = JSON.parse(hospitalRecordJSON.toString());
        }

        // Fetch insurance record
        const insuranceRecordJSON = await ctx.stub.getState(`insurancePatient_${id}`);
        if (insuranceRecordJSON && insuranceRecordJSON.length > 0) {
            insuranceRecord = JSON.parse(insuranceRecordJSON.toString());
        }

        if (!hospitalRecord && !insuranceRecord) {
            throw new Error(`No records found for patient ID ${id}`);
        }

        // Combine both records
        return JSON.stringify({ hospitalRecord, insuranceRecord });
    }
}

module.exports = AssetTransfer;
