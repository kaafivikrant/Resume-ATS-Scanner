import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm";
import { Resume } from "./Resume";
import { JobDescription } from "./JobDescription";
import { AnalysisResult } from "./AnalysisResult";
import { Subscription } from "./Subscription";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed password

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Resume, resume => resume.user)
  resumes: Resume[];

  @OneToMany(() => JobDescription, jobDescription => jobDescription.user)
  jobDescriptions: JobDescription[];

  @OneToMany(() => AnalysisResult, analysisResult => analysisResult.user)
  analysisResults: AnalysisResult[];

  @OneToOne(() => Subscription, subscription => subscription.user)
  subscription: Subscription;
}