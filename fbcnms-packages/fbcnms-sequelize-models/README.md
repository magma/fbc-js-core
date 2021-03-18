# fbcnms-sequelize-models

## dbDataMigration Usage

Used for migration of sequelize-models data from one DB to another

**Example: Manual Usage**
```
$ yarn start

? Enter Source DB host: mariadb
? Enter Source DB port: 3306
? Enter Source DB database name: nms
? Enter Source DB username: root
? Enter Source DB password: [hidden]
? Enter Source DB SQL dialect: mariadb

Source DB Connection Config:
---------------------------
Host: mariadb:3306
Database: nms
Username: root
Dialect: mariadb

? Would you like to run data migration with these settings?: Yes
Completed data migration to target DB
```

**Example: Automated Usage**
```
$ npm start -- --username=nms --password=nms --database=nms --host=mariadb --port=3306 --dialect=mariadb --confirm

Source DB Connection Config:
---------------------------
Host: mariadb:3306
Database: nms
Username: nms
Dialect: mariadb

Completed data migration to target DB
```
