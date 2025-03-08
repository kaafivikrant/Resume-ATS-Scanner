import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Resume } from "./Resume";
import { JobDescription } from "./JobDescription";

@Entity("analysis_results")
export class AnalysisResult {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int")
  overallScore: number;

  @Column("jsonb")
  categories: {
    keywordMatch: {
      score: number;
      matches: string[];
      missing: string[];
    };
    repetition: {
      score: number;
      overusedWords: string[];
    };
    jobFit: {
      score: number;
      feedback: string;
    };
    fillerWords: {
      score: number;
      words: string[];
    };
    growthSignals: {
      score: number;
      feedback: string;
    };
    spelling: {
      score: number;
      errors: string[];
    };
    buzzwords: {
      score: number;
      appropriate: string[];
      excessive: string[];
    };
    unnecessarySections: {
      score: number;
      sections: string[];
    };
  };

  @Column("text", { array: true })
  recommendations: string[];

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, user => user.analysisResults)
  user: User;

  @ManyToOne(() => Resume, resume => resume.analysisResults)
  @JoinColumn({ name: "resumeId" })
  resume: Resume;

  @Column()
  resumeId: string;

  @ManyToOne(() => JobDescription, jobDescription => jobDescription.analysisResults)
  @JoinColumn({ name: "jobDescriptionId" })
  jobDescription: JobDescription;

  @Column()
  jobDescriptionId: string;
}