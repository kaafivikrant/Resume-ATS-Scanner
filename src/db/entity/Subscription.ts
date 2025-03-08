import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { SubscriptionPlan } from "./SubscriptionPlan";

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ default: false })
  active: boolean;

  @Column({ nullable: true })
  currentPeriodStart: Date;

  @Column({ nullable: true })
  currentPeriodEnd: Date;

  @Column({ nullable: true })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: true })
  canceledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, user => user.subscription)
  @JoinColumn()
  user: User;

  @ManyToOne(() => SubscriptionPlan)
  plan: SubscriptionPlan;
}