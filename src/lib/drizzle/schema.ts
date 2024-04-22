import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 10);

export const survey = sqliteTable("survey", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  background: text("background").notNull(),
  objectives: text("objectives").notNull(),
  targetAudiences: text("target_audiences").notNull(),
  preferredLanguages: text("preferred_languages").notNull(),
  initialFormJson: text("initial_form_json").notNull(),
  isActive: integer("is_active", {
    mode: "boolean",
  }).default(false).notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const conversation = sqliteTable("conversation", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  fingerprintId: text("fingerprint_id").notNull(),
  surveyId: text("survey_id").references(() => survey.id),
  chatHistoryJson: text("chat_history_json").notNull(),
  initialFormDataJson: text("initial_form_data_json").notNull().default("{}"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export type Survey = InferSelectModel<typeof survey>;
export type InputSurvey = InferInsertModel<typeof survey>;
export type Conversation = InferSelectModel<typeof conversation>;
export type InputConversation = InferInsertModel<typeof conversation>;
