# fbcnms-sequelize-models

## dbDataMigration Usage

Used for migration of sequelize-models data from one DB to another

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
