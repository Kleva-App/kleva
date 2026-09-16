import { db } from "./db.js";
import { DEFAULT_SCHOOL_ID, schoolById, type School } from "./schools.js";

export type AccountRole = "student" | "teacher" | "parent" | "organization";

export function normalizeAccountRole(value: string): AccountRole | null {
  const role = value.toLowerCase();
  if (role === "student" || role === "teacher" || role === "parent") return role;
  if (role === "organization" || role === "organisation" || role === "institution") {
    return "organization";
  }
  return null;
}

export function publicRoles(roles: string[]) {
  return roles.map((role) => (role === "institution" ? "organization" : role));
}

export async function userHasRole(userId: string, role: string) {
  const row = await db("user_roles").where({ user_id: userId, role }).first("id");
  return Boolean(row);
}

export async function userHasOrganizationRole(userId: string) {
  return (
    (await userHasRole(userId, "organization")) || (await userHasRole(userId, "institution"))
  );
}

export async function assignAccountRole(userId: string, role: AccountRole) {
  if (role === "organization") {
    const legacy = await db("user_roles")
      .where({ user_id: userId, role: "institution" })
      .first("id");
    if (legacy) {
      const existing = await db("user_roles")
        .where({ user_id: userId, role: "organization" })
        .first("id");
      if (existing) {
        await db("user_roles").where({ id: legacy.id }).delete();
      } else {
        await db("user_roles").where({ id: legacy.id }).update({ role: "organization" });
      }
    }
  }

  const existing = await db("user_roles").where({ user_id: userId, role }).first();
  if (!existing) {
    await db("user_roles").insert({ user_id: userId, role });
  }

  if (role === "student") {
    await db("user").where({ id: userId }).whereNull("school_id").update({
      school_id: DEFAULT_SCHOOL_ID,
    });
  }

  if (role === "parent" || role === "organization") {
    await db("user_roles").where({ user_id: userId, role: "student" }).delete();
  }

  if (role === "parent") {
    const profile = await db("parent_profiles").where({ user_id: userId }).first();
    if (!profile) {
      await db("parent_profiles").insert({ user_id: userId });
    }
  }
}

export async function assertParent(userId: string) {
  const ok = await userHasRole(userId, "parent");
  if (!ok) {
    const err = new Error("Parent access required");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

export type LinkedChild = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  relationship: string;
  linkId: string;
  school: School | null;
};

export async function getParentChildren(parentId: string): Promise<LinkedChild[]> {
  const rows = await db("parent_students as ps")
    .join("user as u", "u.id", "ps.student_id")
    .where("ps.parent_id", parentId)
    .select(
      "ps.id as link_id",
      "ps.relationship",
      "u.id",
      "u.name",
      "u.email",
      "u.image",
      "u.school_id",
    )
    .orderBy("u.name");

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image ?? null,
    relationship: row.relationship,
    linkId: row.link_id,
    school: schoolById(row.school_id),
  }));
}

export async function isCourseTeacher(courseId: string, userId: string) {
  const row = await db("courses")
    .where({ id: courseId, teacher_id: userId })
    .first("id");
  return Boolean(row);
}

export async function assertCourseTeacher(courseId: string, userId: string) {
  const ok = await isCourseTeacher(courseId, userId);
  if (!ok) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

export function asProfile(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.name,
    avatar_url: user.image ?? null,
  };
}
