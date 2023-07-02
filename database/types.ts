import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  votes: VotesTable;
}

export interface VotesTable {
  id: Generated<number>;
  year: number;
  semi_final: "f" | "sf" | "sf1" | "sf2";
  edition: string;
  jury_or_televoting: "J" | "T";
  from_country: string;
  to_country: string;
  points: number;
  duplicate?: "x";
}

export type Votes = Selectable<VotesTable>;
export type NewVote = Insertable<VotesTable>;
export type EditedVote = Updateable<VotesTable>;
