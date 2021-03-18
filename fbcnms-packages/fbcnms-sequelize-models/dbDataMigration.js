/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * Script for migration of sequelize-models data from one DB to another.
 *
 * Two databases are involved in this script, denoted as the source
 * database, and the target database.
 * After a successful run of this script, both the source and target
 * data should exist on the target database.
 *
 * While the source DB connection options must be specified,
 * the target DB connection is established automatically using
 * environment variables.
 *
 *
 * Script arguments (specifies source DB only):
 * --username:          DB username
 * --password:          DB password
 * --host:              DB host
 * --port:              DB port
 * --dialect:           DB SQL dialect
 * --confirm: skip final confirmation to run migration
 *
 * Example Usage:
 *  $ node -r @fbcnms/babel-register main.js
 *  ? Enter Source DB host: mariadb
 *  ? Enter Source DB port: 3306
 *  ? Enter Source DB database name: nms
 *  ? Enter Source DB username: root
 *  ? Enter Source DB password: [hidden]
 *  ? Enter Source DB SQL dialect: mariadb
 *
 *  Source DB Connection Config:
 *  ---------------------------
 *  Host: mariadb:3306
 *  Database: nms
 *  Username: root
 *  Dialect: mariadb
 *
 *  ? Would you like to run data migration with these settings?: Yes
 *  Completed data migration to target DB
 */

/* eslint no-console: "off" */

const inquirer = require('inquirer');
const process = require('process');
const argv = require('minimist')(process.argv.slice(2));
const {importFromDatabase} = require('./index');
import {User} from './index';
import type {Options} from 'sequelize';

const dbQuestions = [
  {
    type: 'input',
    name: 'host',
    message: 'Enter Source DB host:',
    default: 'mariadb',
  },
  {
    type: 'input',
    name: 'port',
    message: 'Enter Source DB port:',
    default: 3306,
  },
  {
    type: 'input',
    name: 'database',
    message: 'Enter Source DB database name:',
    default: 'nms',
  },
  {
    type: 'input',
    name: 'username',
    message: 'Enter Source DB username:',
    default: 'root',
  },
  {
    type: 'password',
    name: 'password',
    message: 'Enter Source DB password:',
  },
  {
    type: 'input',
    name: 'dialect',
    message: 'Enter Source DB SQL dialect:',
    default: 'mariadb',
  },
];

async function isMigrationNeeded(): Promise<boolean> {
  try {
    const allUsers = await User.findAll();
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

async function getDbOptions(): Promise<Options> {
  let dbOptions: Options = {};

  if (
    argv['username'] &&
    argv['password'] &&
    argv['database'] &&
    argv['host'] &&
    argv['port'] &&
    argv['dialect']
  ) {
    dbOptions = {
      username: argv['username'],
      password: argv['password'],
      database: argv['database'],
      host: argv['host'],
      port: parseInt(argv['port']),
      dialect: argv['dialect'],
      logging: (msg: string) => console.log(msg),
    };
    console.log(argv);
  } else {
    await inquirer.prompt(dbQuestions).then(answers => {
      dbOptions = {
        username: answers['username'],
        password: answers['password'],
        database: answers['database'],
        host: answers['host'],
        port: parseInt(answers['port']),
        dialect: answers['dialect'],
        logging: (msg: string) => console.log(msg),
      };
    });
  }
  return dbOptions;
}

function displayDbOptions(dbOptions: Options) {
  const notice =
    `\n` +
    `Source DB Connection Config:\n` +
    `---------------------------\n` +
    `Host: ${dbOptions.host || ''}:${dbOptions.port || 0} \n` +
    `Database: ${dbOptions.database || ''} \n` +
    `Username: ${dbOptions.username || ''} \n` +
    `Dialect: ${dbOptions.dialect || ''} \n`;

  console.log(notice);
}

async function confirmAndRunMigration(dbOptions: Options): Promise<void> {
  if (argv['confirm']) {
    await runMigration(dbOptions);
    return;
  }

  await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'willRun',
        message: 'Would you like to run data migration with these settings?:',
      },
    ])
    .then(confirmation => {
      if (confirmation['willRun']) {
        (async () => {
          await runMigration(dbOptions);
        })();
        return;
      }
      console.log('Aborting data migration');
    });
}

async function runMigration(dbOptions: Options): Promise<void> {
  try {
    await importFromDatabase(dbOptions);
    console.log('Completed data migration to target DB');
  } catch (error) {
    console.log(
      `Unable to connect to source database for migration:\n` +
        `--------------------------------------------------------------------------\n` +
        `${error}\n` +
        `--------------------------------------------------------------------------\n`,
    );
    process.exit(1);
  }
}

function main() {
  (async () => {
    const willRunMigration = await isMigrationNeeded();
    if (!willRunMigration) {
      console.log('Skipping migration from source DB');
      return;
    }

    const dbOptions: Options = await getDbOptions();
    displayDbOptions(dbOptions);

    await confirmAndRunMigration(dbOptions);
  })();
}

main();
