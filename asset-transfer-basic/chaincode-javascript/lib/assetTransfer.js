'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    // Initialize ledger with some records
    async InitLedger(ctx) {
        const records = [
            {
                ID: 'record1',
                Name: 'John Doe',
                Gender: 'Male',
                BloodType: 'O+',
                Allergies: 'Peanuts',
                Diagnosis: 'Hypertension',
                Treatment: 'Medication A',
                Billing: {
                    Total: 1000,
                    Paid: 500,
                    Due: 500,
                },
            },
            {
                ID: 'record2',
                Name: 'Jane Smith',
                Gender: 'Female',
                BloodType: 'A-',
                Allergies: 'None',
                Diagnosis: 'Diabetes',
                Treatment: 'Insulin Therapy',
                Billing: {
                    Total: 1500,
                    Paid: 1500,
                    Due: 0,
                },
            },
        ];

        for (const record of records) {
            record.docType = 'healthRecord';
            await ctx.stub.putState(record.ID, Buffer.from(stringify(sortKeysRecursive(record))));
        }
    }

    // CreateRecord issues a new health record to the world state with given details.
    async CreateRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment, billing) {
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
            Billing: JSON.parse(billing),
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        // Emit an event for billing sync
        await ctx.stub.setEvent('BillingCreated', Buffer.from(JSON.stringify({ ID: id, Billing: record.Billing })));

        return JSON.stringify(record);
    }

    // Read full health record
    async ReadRecord(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        return recordJSON.toString();
    }

    // Read limited data for insurance
    async ReadRecordForInsurance(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        const record = JSON.parse(recordJSON.toString());
        return JSON.stringify({
            ID: record.ID,
            Name: record.Name,
            Billing: record.Billing,
        });
    }

    // Read limited data for patients
    async ReadRecordForPatient(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        const record = JSON.parse(recordJSON.toString());
        return JSON.stringify({
            ID: record.ID,
            Name: record.Name,
            Gender: record.Gender,
            BloodType: record.BloodType,
            Allergies: record.Allergies,
            Diagnosis: record.Diagnosis,
            Treatment: record.Treatment,
        });
    }

    // UpdateRecord updates a health record
    async UpdateRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment, billing) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }

        const recordJSON = await this.ReadRecord(ctx, id);
        const record = JSON.parse(recordJSON);

        record.Name = name;
        record.Gender = gender;
        record.BloodType = bloodType;
        record.Allergies = allergies;
        record.Diagnosis = diagnosis;
        record.Treatment = treatment;
        record.Billing = JSON.parse(billing);
        record.Timestamp = new Date().toISOString();

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(record))));

        // Emit an event for billing sync
        await ctx.stub.setEvent('BillingUpdated', Buffer.from(JSON.stringify({ ID: id, Billing: record.Billing })));

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
