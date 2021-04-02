# fbcnms-sequelize-models

A NMS-specific wrapper around the [Sequelize ORM](https://sequelize.org/).

Sequelize-models includes pre-defined models for common NMS entities such as organizations,
users, feature flags, and even audit log entries.

---

## Usage

Sequelize-models uses the DB specified by the following environment variables:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_DIALECT`


**Organization Usage**
```
import {Organization} from '@fbcnms/sequelize-models';

async function findOrganization(orgName) {
  const org = await Organization.findOne({
    where: {
      name: orgName,
    },
  });
  return org;
}

async createDefaultOrganization() {
  await Organization.create({
    name: organization,
    tab: ['inventory', 'nms'],
    networkIDs: [],
    csvCharset: '',
    ssoCert: '',
    ssoIssuer: '',
    ssoEntrypoint: '',
  });
}
```

---

## DB Data Migration Usage

Functionality is also provided if you need to migrate your data between databases.

**Example: Manual Usage**
```
$ yarn dbDataMigrate

? Enter DB host: mariadb
? Enter DB port: 3306
? Enter DB database name: nms
? Enter DB username: root
? Enter DB password: [hidden]
? Enter DB SQL dialect: mariadb

DB Connection Config:
---------------------------
Host: mariadb:3306
Database: nms
Username: root
Dialect: mariadb

? Are you importing from the specified DB, or exporting to it?: import
? Would you like to run data migration with these settings?: Yes
Completed data migration, importing from specified DB
```

**Example: Automated Usage**
```
$ npm dbDataMigrate -- --username=nms --password=nms --database=nms --host=mariadb --port=3306 --dialect=mariadb --export --confirm

DB Connection Config:
---------------------------
Host: mariadb:3306
Database: nms
Username: nms
Dialect: mariadb

Completed data migration, exporting to specified DB
```
