/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

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
        return JSON.stringify(record);
    }

    // ReadRecord returns the health record stored in the world state with given id.
    async ReadRecord(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        return recordJSON.toString();
    }

    // ReadRecordForInsurance returns only billing and personal info for insurance.
    async ReadRecordForInsurance(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        if (!recordJSON || recordJSON.length === 0) {
            throw new Error(`The record ${id} does not exist`);
        }
        const record = JSON.parse(recordJSON.toString());
        const limitedRecord = {
            ID: record.ID,
            Name: record.Name,
            Billing: record.Billing,
        };
        return JSON.stringify(limitedRecord);
    }

    // UpdateRecord updates an existing health record in the world state with provided parameters.
    async UpdateRecord(ctx, id, name, gender, bloodType, allergies, diagnosis, treatment, billing) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }

        const updatedRecord = {
            ID: id,
            Name: name,
            Gender: gender,
            BloodType: bloodType,
            Allergies: allergies,
            Diagnosis: diagnosis,
            Treatment: treatment,
            Billing: JSON.parse(billing),
        };
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedRecord))));
    }

    // DeleteRecord deletes a given health record from the world state.
    async DeleteRecord(ctx, id) {
        const exists = await this.RecordExists(ctx, id);
        if (!exists) {
            throw new Error(`The record ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // RecordExists returns true when a health record with given ID exists in world state.
    async RecordExists(ctx, id) {
        const recordJSON = await ctx.stub.getState(id);
        return recordJSON && recordJSON.length > 0;
    }

    // GetAllRecords returns all health records found in the world state.
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
