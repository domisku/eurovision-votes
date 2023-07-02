import { sql } from "kysely";
import { db } from "../database/database";

export async function getCountries() {
  return await db
    .selectFrom("votes")
    .select(sql`DISTINCT to_country`.as("country"))
    .orderBy("country", "asc")
    .execute();
}

export async function getTopCountryVoters(country: string, limit = 5) {
  return await db
    .selectFrom("votes")
    .select(["from_country", sql`SUM(points)`.as("points_sum")])
    .where("to_country", "=", country)
    .groupBy(["from_country"])
    .orderBy(sql`SUM(points)`, "desc")
    .limit(limit)
    .execute();
}

export async function getBottomCountryVoters(country: string, limit = 5) {
  return await db
    .selectFrom("votes")
    .select(["from_country", sql`SUM(points)`.as("points_sum")])
    .where("to_country", "=", country)
    .where("from_country", "!=", country)
    .where("from_country", "!=", "Rest of the World")
    .groupBy(["from_country"])
    .orderBy(sql`SUM(points)`, "asc")
    .limit(limit)
    .execute();
}

export async function getPercentageOfPointsPerEdition(country: string) {
  return await db
    .with("total_edition_votes", (qb) => {
      return qb
        .selectFrom("votes")
        .select(["edition", sql`SUM(points)`.as("sum")])
        .groupBy("edition")
        .orderBy("edition");
    })
    .selectFrom(["votes"])
    .innerJoin("total_edition_votes as t", "votes.edition", "t.edition")
    .select([
      "votes.edition",
      sql`ROUND((SUM(votes.points) / AVG(t.sum)) * 100, 2)`.as("percentage"),
    ])
    .where("to_country", "=", country)
    .groupBy(["votes.edition"])
    .having("votes.edition", "not like", "%sf%")
    .orderBy("votes.edition")
    .execute();
}

export async function getChanceToQualifyToFinals(country: string) {
  return await db
    .with("years_with_semifinal", (qb) => {
      return qb
        .selectFrom("votes")
        .select(["year"])
        .where("to_country", "=", country)
        .where("semi_final", "like", "sf%" as any)
        .groupBy("year")
        .having(sql`COUNT(DISTINCT semi_final)`, "=", 1);
    })
    .with("passes", (qb) => {
      return qb
        .selectFrom("votes")
        .select(["year", sql`COUNT(DISTINCT semi_final)`.as("count")])
        .where("to_country", "=", country)
        .where("year", "in", (qb) => {
          return qb.selectFrom("years_with_semifinal").select("year");
        })
        .groupBy("year");
    })
    .selectFrom("passes")
    .select(
      sql`ROUND(
        (
        COUNT(CASE WHEN count = 2 THEN 1 ELSE NULL END) * 1.0
        / NULLIF(COUNT(*), 0)
        ) * 100, 2)`.as("qualify_chance")
    )
    .execute();
}
