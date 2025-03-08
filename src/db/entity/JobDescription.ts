import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { AnalysisResult } from "./AnalysisResult";

@Entity("job_descriptions")
export class JobDescription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  company: string;

  @Column("text")
  content: string;

  @Column({ length: 50 })
  source: string; // 'manual' or 'url'

  @Column({ length: 255, nullable: true })
  url: string;

  @CreateDateColumn()
  saveDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.jobDescriptions)
  user: User;

  @OneToMany(() => AnalysisResult, analysisResult => analysisResult.jobDescription)
  analysisResults: AnalysisResult[];
}