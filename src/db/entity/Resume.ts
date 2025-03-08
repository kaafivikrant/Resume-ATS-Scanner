import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { AnalysisResult } from "./AnalysisResult";

@Entity("resumes")
export class Resume {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column("text")
  content: string;

  @Column({ length: 255 })
  filePath: string;

  @Column({ length: 50 })
  fileType: string;

  @Column("int")
  fileSize: number;

  @CreateDateColumn()
  uploadDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.resumes)
  user: User;

  @OneToMany(() => AnalysisResult, analysisResult => analysisResult.resume)
  analysisResults: AnalysisResult[];
}