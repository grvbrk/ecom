/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    BEGIN;

    ALTER TABLE "Order" RENAME to Orders;
    ALTER TABLE "User" RENAME to Users;
    ALTER TABLE Product RENAME to Products;

    COMMIT;

  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    BEGIN;

    ALTER TABLE Orders RENAME to "Order";
    ALTER TABLE Users RENAME to "User";
    ALTER TABLE Products RENAME to Product;

    COMMIT;

  `);
};
