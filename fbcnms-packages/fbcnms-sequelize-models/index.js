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

import AuditLogEntryModel from './models/audit_log_entry';
import FeatureFlagModel from './models/featureflag';
import OrganizationModel from './models/organization';
import Sequelize from 'sequelize';
import UserModel from './models/user';
import sequelizeConfig from './sequelizeConfig';

const env = process.env.NODE_ENV || 'development';
const config = sequelizeConfig[env];

export const sequelize = new Sequelize(
  config.database || '',
  config.username,
  config.password,
  config,
);

const db = createNmsDb(sequelize);

function createNmsDb(sequelize: Sequelize) {
  const db = {
    AuditLogEntry: AuditLogEntryModel(sequelize, Sequelize),
    FeatureFlag: FeatureFlagModel(sequelize, Sequelize),
    Organization: OrganizationModel(sequelize, Sequelize),
    User: UserModel(sequelize, Sequelize),
  };

  Object.keys(db).forEach(
    modelName => db[modelName].associate != null && db[modelName].associate(db),
  );
  return db;
}

// $FlowIgnore Cannot define type for userModel
async function isMigrationNeeded(userModel): Promise<boolean> {
  try {
    const allUsers = await userModel.findAll();
    if (allUsers.length > 0) {
      console.warn('Users found in target DB. Migration may already have run');
      return await false;
    }
    return await true;
  } catch (e) {
    console.error(
      `Unable to run migration. Connection error to specified database: \n` +
        `------------------------\n` +
        `${e} \n` +
        `------------------------\n`,
    );
    process.exit(1);
  }
  return await false;
}

export const AuditLogEntry = db.AuditLogEntry;
export const Organization = db.Organization;
export const User = db.User;
export const FeatureFlag = db.FeatureFlag;

export function jsonArrayContains(column: string, value: string) {
  if (
    sequelize.getDialect() === 'mysql' ||
    sequelize.getDialect() === 'mariadb'
  ) {
    return Sequelize.fn('JSON_CONTAINS', Sequelize.col(column), `"${value}"`);
  } else if (sequelize.getDialect() === 'postgres') {
    const escapedColumn = sequelize
      .getQueryInterface()
      .quoteIdentifier(column, true);
    const escapedValue = sequelize
      .getQueryInterface()
      .quoteIdentifier(value, true);
    return Sequelize.literal(`${escapedColumn}::jsonb @> '${escapedValue}'`);
  } else {
    // sqlite
    const escapedColumn = sequelize
      .getQueryInterface()
      .quoteIdentifier(column, true);
    const innerQuery = Sequelize.literal(
      `(SELECT 1 FROM json_each(${escapedColumn})` +
        `WHERE json_each.value = ${sequelize.escape(value)})`,
    );
    return Sequelize.where(innerQuery, 'IS', Sequelize.literal('NOT NULL'));
  }
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

  await migrateMeta(sourceSequelize, sequelize);

  // $FlowIgnore findAll function exists for AuditLogEntry
  const auditLogEntries = await sourceDb.AuditLogEntry.findAll();
  await AuditLogEntry.bulkCreate(getDataValues(auditLogEntries));

  // $FlowIgnore findAll function exists for FeatureFlag
  const featureFlags = await sourceDb.FeatureFlag.findAll();
  await FeatureFlag.bulkCreate(getDataValues(featureFlags));

  // NOTE: While the tabs field should be non-null, it does happen
  // $FlowIgnore findAll function exists for Organization
  const organizations = await sourceDb.Organization.findAll();
  organizations.forEach(organization => {
    organization.tabs = organization.tabs || [];
  });
  await Organization.bulkCreate(getDataValues(organizations));

  // $FlowIgnore findAll function exists for User
  const users = await sourceDb.User.findAll();
  users.forEach(user => {
    user.tabs = user.tabs || [];
  });
  await User.bulkCreate(getDataValues(users));
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

  await migrateMeta(sequelize, targetSequelize);

  // $FlowIgnore findAll function exists for AuditLogEntry
  const auditLogEntries = await AuditLogEntry.findAll();
  await targetDb.AuditLogEntry.bulkCreate(getDataValues(auditLogEntries));

  // $FlowIgnore findAll function exists for FeatureFlag
  const featureFlags = await FeatureFlag.findAll();
  await targetDb.FeatureFlag.bulkCreate(getDataValues(featureFlags));

  // NOTE: While the tabs field should be non-null, it does happen
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

async function migrateMeta(source: Sequelize, target: Sequelize) {
  // Read in the current SequelizeMeta data
  const rows = await sequelize.query('SELECT * FROM `SequelizeMeta`', {
    type: source.QueryTypes.SELECT,
  });

  // Write SequelizeMeta data
  const targetInterface = target.getQueryInterface();
  await targetInterface.createTable('SequelizeMeta', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
  });
  await targetInterface.bulkInsert('SequelizeMeta', rows);
}

// eslint-disable-next-line flowtype/no-weak-types
function getDataValues(sequelizeModels: Array<Object>): Array<Object> {
  return sequelizeModels.map(model => model.dataValues);
}
