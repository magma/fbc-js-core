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
import {isMigrationNeeded} from './precheck';

// eslint-disable-next-line flowtype/no-weak-types
function getDataValues(sequelizeModels: Array<Object>): Array<Object> {
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

  await sourceDb.AuditLogEntry.sync();
  await sourceDb.FeatureFlag.sync();
  await sourceDb.Organization.sync();
  await sourceDb.User.sync();

  const willRunMigration = await isMigrationNeeded(User);
  if (!willRunMigration) {
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

  await targetDb.AuditLogEntry.sync();
  await targetDb.FeatureFlag.sync();
  await targetDb.Organization.sync();
  await targetDb.User.sync();

  const willRunMigration = await isMigrationNeeded(targetDb.User);
  if (!willRunMigration) {
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
  const organizations = await Organization.findAll();
  organizations.forEach(organization => {
    organization.tabs = organization.tabs || [];
  });
  await targetDb.Organization.bulkCreate(getDataValues(organizations));

  // $FlowIgnore findAll function exists for User
  const users = await User.findAll();
  users.forEach(user => {
    user.tabs = user.tabs || [];
  });
  await targetDb.User.bulkCreate(getDataValues(users));
}
