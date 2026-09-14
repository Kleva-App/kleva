import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("finance_applications", (t) => {
    t.text("school_id");
    t.text("school_name");
    t.text("school_level");
    t.text("school_province");
    t.text("school_district");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("finance_applications", (t) => {
    t.dropColumns(
      "school_id",
      "school_name",
      "school_level",
      "school_province",
      "school_district",
    );
  });
}
