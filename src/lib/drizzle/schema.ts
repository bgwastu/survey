import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 10);

export const survey = sqliteTable("survey", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  background: text("background").notNull(),
  objectives: text("objectives").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const conversation = sqliteTable("conversation", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  surveyId: text("survey_id").references(() => survey.id),
  summary: text("summary").notNull(),
  chatHistoryJson: text("chat_history_json").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export type Survey = InferSelectModel<typeof survey>;
export type InputSurvey = InferInsertModel<typeof survey>;
export type Conversation = InferSelectModel<typeof conversation>;
export type InputConversation = InferInsertModel<typeof conversation>;
