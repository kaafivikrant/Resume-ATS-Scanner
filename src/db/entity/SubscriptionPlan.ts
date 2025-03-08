import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("subscription_plans")
export class SubscriptionPlan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  planId: string; // 'free', 'pro', 'enterprise'

  @Column()
  name: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("text", { array: true })
  features: string[];

  @Column("jsonb")
  limits: {
    resumeUploads: number;
    savedJobDescriptions: number;
    analysisHistory: number;
    aiRewrites: boolean;
  };

  @Column({ nullable: true })
  stripePriceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}