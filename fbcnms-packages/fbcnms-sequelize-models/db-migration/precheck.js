/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Options} from 'sequelize';

import Sequelize from 'sequelize';
import {
  AuditLogEntry,
  FeatureFlag,
  Organization,
  User,
  createNmsDb,
} from '../index';

// eslint-disable-next-line flowtype/no-weak-types
export function getDataValues(sequelizeModels: Array<Object>): Array<Object> {
  return sequelizeModels.map(model => model.dataValues);
}

export async function importFromDatabase(sourceConfig: Options) {
  const sourceSequelize = new Sequelize(
    sourceConfig.database || '',
    sourceConfig.username,
    sourceConfig.password,
    sourceConfig,
  );
  const sourceDb = createNmsDb(sourceSequelize);

  const isNeeded = await isMigrationNeeded(User);
  if (!isNeeded) {
    console.log('Skipping DB migration');
    return;
  }

  // $FlowIgnore findAll function exists for AuditLogEntry
  const auditLogEntries = await sourceDb.AuditLogEntry.findAll();
  await AuditLogEntry.bulkCreate(getDataValues(auditLogEntries));

  // $FlowIgnore findAll function exists for FeatureFlag
  const featureFlags = await sourceDb.FeatureFlag.findAll();
  await FeatureFlag.bulkCreate(getDataValues(featureFlags));

  // $FlowIgnore findAll function exists for Organization
  const organization = await sourceDb.Organization.findAll();
  await Organization.bulkCreate(getDataValues(organization));

  // $FlowIgnore findAll function exists for User
  const user = await sourceDb.User.findAll();
  await User.bulkCreate(getDataValues(user));
}

export async function exportToDatabase(targetConfig: Options) {
  const targetSequelize = new Sequelize(
    targetConfig.database || '',
    targetConfig.username,
    targetConfig.password,
    targetConfig,
  );
  const targetDb = createNmsDb(targetSequelize);

  const isNeeded = await isMigrationNeeded(targetDb.User);
  if (!isNeeded) {
    console.log('Skipping DB migration');
    return;
  }

  // $FlowIgnore findAll function exists for AuditLogEntry
  const auditLogEntries = await AuditLogEntry.findAll();
  await targetDb.AuditLogEntry.bulkCreate(getDataValues(auditLogEntries));

  // $FlowIgnore findAll function exists for FeatureFlag
  const featureFlags = await FeatureFlag.findAll();
  await targetDb.FeatureFlag.bulkCreate(getDataValues(featureFlags));

  // $FlowIgnore findAll function exists for Organization
  const organization = await Organization.findAll();
  await targetDb.Organization.bulkCreate(getDataValues(organization));

  // $FlowIgnore findAll function exists for User
  const user = await User.findAll();
  await targetDb.User.bulkCreate(getDataValues(user));
}

// $FlowIgnore Cannot define type for userModel
export async function isMigrationNeeded(userModel): Promise<boolean> {
  try {
    const allUsers = await userModel.findAll();
    if (allUsers.length > 0) {
      console.warn('Users found in target DB. Migration may already have run');
      return await false;
    }
    return await true;
  } catch (e) {
    console.error(
      `Unable to run migration. Connection error to target database: \n` +
        `------------------------\n` +
        `${e} \n` +
        `------------------------\n`,
    );
    process.exit(1);
  }
  return await false;
}
