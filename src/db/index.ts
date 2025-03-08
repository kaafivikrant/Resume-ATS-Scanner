import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Resume } from "./entity/Resume";
import { JobDescription } from "./entity/JobDescription";
import { AnalysisResult } from "./entity/AnalysisResult";
import { Subscription } from "./entity/Subscription";
import { SubscriptionPlan } from "./entity/SubscriptionPlan";

// Initialize database connection
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");
    return true;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    return false;
  }
};

// Repositories
export const userRepository = AppDataSource.getRepository(User);
export const resumeRepository = AppDataSource.getRepository(Resume);
export const jobDescriptionRepository = AppDataSource.getRepository(JobDescription);
export const analysisResultRepository = AppDataSource.getRepository(AnalysisResult);
export const subscriptionRepository = AppDataSource.getRepository(Subscription);
export const subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);

export {
  User,
  Resume,
  JobDescription,
  AnalysisResult,
  Subscription,
  SubscriptionPlan
};