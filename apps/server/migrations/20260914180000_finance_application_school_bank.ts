import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("finance_applications", (t) => {
    t.text("school_bank");
    t.text("school_account_name");
    t.text("school_account_number");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("finance_applications", (t) => {
    t.dropColumns("school_bank", "school_account_name", "school_account_number");
  });
}
