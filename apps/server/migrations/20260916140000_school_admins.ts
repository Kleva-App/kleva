import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("school_admins", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("user_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    t.text("school_id")
      .notNullable()
      .references("id")
      .inTable("schools")
      .onDelete("CASCADE");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.unique(["user_id", "school_id"]);
    t.index(["user_id"]);
    t.index(["school_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("school_admins");
}
