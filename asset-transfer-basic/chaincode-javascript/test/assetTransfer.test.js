/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

const AssetTransfer = require('../lib/assetTransfer.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('Asset Transfer Basic Tests', () => {
    let transactionContext, chaincodeStub, asset;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

        chaincodeStub.getStateByRange.callsFake(async () => {
            function* internalGetStateByRange() {
                if (chaincodeStub.states) {
                    // Shallow copy
                    const copied = Object.assign({}, chaincodeStub.states);

                    for (let key in copied) {
                        yield { value: copied[key] };
                    }
                }
            }

            return Promise.resolve(internalGetStateByRange());
        });

        asset = {
            ID: 'asset1',
            Color: 'blue',
            Size: 5,
            Owner: 'Tomoko',
            AppraisedValue: 300,
            Gender: 'Female',
            BloodType: 'O+',
            Allergies: 'Peanuts',
            Diagnosis: 'Flu',
            Treatment: 'Rest and hydration',
            Billing: 500,
        };
    });

    describe('Test InitLedger', () => {
        it('should return success on InitLedger', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.InitLedger(transactionContext);
            let ret = JSON.parse((await chaincodeStub.getState('asset1')).toString());
            expect(ret).to.eql(Object.assign({ docType: 'asset' }, asset));
        });
    });

    describe('Test CreateAsset', () => {
        it('should return success on CreateAsset', async () => {
            let assetTransfer = new AssetTransfer();

            await assetTransfer.CreateAsset(
                transactionContext,
                asset.ID,
                asset.Color,
                asset.Size,
                asset.Owner,
                asset.AppraisedValue,
                asset.Gender,
                asset.BloodType,
                asset.Allergies,
                asset.Diagnosis,
                asset.Treatment,
                asset.Billing
            );

            let ret = JSON.parse((await chaincodeStub.getState(asset.ID)).toString());
            expect(ret).to.eql(asset);
        });
    });

    describe('Test ReadAsset', () => {
        it('should return success on ReadAsset', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.CreateAsset(
                transactionContext,
                asset.ID,
                asset.Color,
                asset.Size,
                asset.Owner,
                asset.AppraisedValue,
                asset.Gender,
                asset.BloodType,
                asset.Allergies,
                asset.Diagnosis,
                asset.Treatment,
                asset.Billing
            );

            let ret = JSON.parse(await chaincodeStub.getState(asset.ID));
            expect(ret).to.eql(asset);
        });
    });

    describe('Test ReadRecordForInsurance', () => {
        it('should return insurance-specific fields', async () => {
            let assetTransfer = new AssetTransfer();
            await assetTransfer.CreateAsset(
                transactionContext,
                asset.ID,
                asset.Color,
                asset.Size,
                asset.Owner,
                asset.AppraisedValue,
                asset.Gender,
                asset.BloodType,
                asset.Allergies,
                asset.Diagnosis,
                asset.Treatment,
                asset.Billing
            );

            let ret = await assetTransfer.ReadRecordForInsurance(transactionContext, asset.ID);
            ret = JSON.parse(ret);
            let expected = {
                ID: 'asset1',
                Owner: 'Tomoko',
                Diagnosis: 'Flu',
                Treatment: 'Rest and hydration',
                Billing: 500,
            };
            expect(ret).to.eql(expected);
        });
    });

    describe('Test GetAllAssets', () => {
        it('should return success on GetAllAssets', async () => {
            let assetTransfer = new AssetTransfer();

            await assetTransfer.CreateAsset(
                transactionContext,
                'asset1',
                'blue',
                5,
                'Robert',
                100,
                'Male',
                'A+',
                'None',
                'Cold',
                'Medication',
                200
            );
            await assetTransfer.CreateAsset(
                transactionContext,
                'asset2',
                'orange',
                10,
                'Paul',
                200,
                'Male',
                'B+',
                'Dust',
                'Asthma',
                'Inhaler',
                400
            );

            let ret = await assetTransfer.GetAllAssets(transactionContext);
            ret = JSON.parse(ret);
            expect(ret.length).to.equal(2);

            let expected = [
                {
                    ID: 'asset1',
                    Color: 'blue',
                    Size: 5,
                    Owner: 'Robert',
                    AppraisedValue: 100,
                    Gender: 'Male',
                    BloodType: 'A+',
                    Allergies: 'None',
                    Diagnosis: 'Cold',
                    Treatment: 'Medication',
                    Billing: 200,
                },
                {
                    ID: 'asset2',
                    Color: 'orange',
                    Size: 10,
                    Owner: 'Paul',
                    AppraisedValue: 200,
                    Gender: 'Male',
                    BloodType: 'B+',
                    Allergies: 'Dust',
                    Diagnosis: 'Asthma',
                    Treatment: 'Inhaler',
                    Billing: 400,
                },
            ];

            expect(ret).to.eql(expected);
        });
    });
});
