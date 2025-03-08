import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Resume } from "./entity/Resume";
import { JobDescription } from "./entity/JobDescription";
import { AnalysisResult } from "./entity/AnalysisResult";
import { Subscription } from "./entity/Subscription";
import { SubscriptionPlan } from "./entity/SubscriptionPlan";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: import.meta.env.VITE_DB_HOST || "localhost",
  port: parseInt(import.meta.env.VITE_DB_PORT || "5432"),
  username: import.meta.env.VITE_DB_USERNAME || "postgres",
  password: import.meta.env.VITE_DB_PASSWORD || "postgres",
  database: import.meta.env.VITE_DB_NAME || "resume_ats_scanner",
  synchronize: false, // Set to false in production
  logging: import.meta.env.DEV === "true",
  entities: [User, Resume, JobDescription, AnalysisResult, Subscription, SubscriptionPlan],
  migrations: ["src/db/migrations/*.ts"],
  subscribers: [],
});