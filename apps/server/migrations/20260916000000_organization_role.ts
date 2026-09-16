import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const rows = await knex("user_roles")
    .where({ role: "institution" })
    .select("id", "user_id");

  for (const row of rows) {
    const existing = await knex("user_roles")
      .where({ user_id: row.user_id, role: "organization" })
      .first("id");
    if (existing) {
      await knex("user_roles").where({ id: row.id }).delete();
    } else {
      await knex("user_roles").where({ id: row.id }).update({ role: "organization" });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  const rows = await knex("user_roles")
    .where({ role: "organization" })
    .select("id", "user_id");

  for (const row of rows) {
    const existing = await knex("user_roles")
      .where({ user_id: row.user_id, role: "institution" })
      .first("id");
    if (existing) {
      await knex("user_roles").where({ id: row.id }).delete();
    } else {
      await knex("user_roles").where({ id: row.id }).update({ role: "institution" });
    }
  }
}
