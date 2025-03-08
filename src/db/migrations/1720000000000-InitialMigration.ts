import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1720000000000 implements MigrationInterface {
    name = 'InitialMigration1720000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create subscription_plans table
        await queryRunner.query(`
            CREATE TABLE "subscription_plans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "planId" character varying NOT NULL,
                "name" character varying NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "features" text array NOT NULL,
                "limits" jsonb NOT NULL,
                "stripePriceId" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_subscription_plans_planId" UNIQUE ("planId"),
                CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("id")
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "resetPasswordToken" character varying,
                "resetPasswordExpires" TIMESTAMP,
                "emailVerified" boolean NOT NULL DEFAULT false,
                "emailVerificationToken" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create subscriptions table
        await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "stripeCustomerId" character varying,
                "stripeSubscriptionId" character varying,
                "active" boolean NOT NULL DEFAULT false,
                "currentPeriodStart" TIMESTAMP,
                "currentPeriodEnd" TIMESTAMP,
                "cancelAtPeriodEnd" boolean,
                "canceledAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "planId" uuid,
                CONSTRAINT "REL_subscriptions_userId" UNIQUE ("userId"),
                CONSTRAINT "PK_subscriptions" PRIMARY KEY ("id")
            )
        `);

        // Create resumes table
        await queryRunner.query(`
            CREATE TABLE "resumes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "content" text NOT NULL,
                "filePath" character varying(255) NOT NULL,
                "fileType" character varying(50) NOT NULL,
                "fileSize" integer NOT NULL,
                "uploadDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_resumes" PRIMARY KEY ("id")
            )
        `);

        // Create job_descriptions table
        await queryRunner.query(`
            CREATE TABLE "job_descriptions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "company" character varying(255),
                "content" text NOT NULL,
                "source" character varying(50) NOT NULL,
                "url" character varying(255),
                "saveDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_job_descriptions" PRIMARY KEY ("id")
            )
        `);

        // Create analysis_results table
        await queryRunner.query(`
            CREATE TABLE "analysis_results" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "overallScore" integer NOT NULL,
                "categories" jsonb NOT NULL,
                "recommendations" text array NOT NULL,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "resumeId" uuid NOT NULL,
                "jobDescriptionId" uuid NOT NULL,
                "userId" uuid,
                CONSTRAINT "PK_analysis_results" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ADD CONSTRAINT "FK_subscriptions_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ADD CONSTRAINT "FK_subscriptions_subscription_plans" 
            FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "resumes" 
            ADD CONSTRAINT "FK_resumes_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "job_descriptions" 
            ADD CONSTRAINT "FK_job_descriptions_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "analysis_results" 
            ADD CONSTRAINT "FK_analysis_results_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "analysis_results" 
            ADD CONSTRAINT "FK_analysis_results_resumes" 
            FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "analysis_results" 
            ADD CONSTRAINT "FK_analysis_results_job_descriptions" 
            FOREIGN KEY ("jobDescriptionId") REFERENCES "job_descriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // Insert default subscription plans
        await queryRunner.query(`
            INSERT INTO "subscription_plans" ("planId", "name", "price", "features", "limits")
            VALUES 
            ('free', 'Free', 0, 
                ARRAY['Basic resume analysis', '3 resume uploads', '3 job descriptions', 'Basic keyword matching', '7-day analysis history'],
                '{"resumeUploads": 3, "savedJobDescriptions": 3, "analysisHistory": 5, "aiRewrites": false}'
            ),
            ('pro', 'Pro', 9.99, 
                ARRAY['Advanced resume analysis', 'Unlimited resume uploads', 'Unlimited job descriptions', 'Advanced keyword matching', 'Detailed section analysis', '30-day analysis history', 'AI-powered rewrite suggestions'],
                '{"resumeUploads": 9999, "savedJobDescriptions": 9999, "analysisHistory": 30, "aiRewrites": true}'
            ),
            ('enterprise', 'Enterprise', 29.99, 
                ARRAY['Everything in Pro', 'Team management', 'Bulk analysis', 'API access', 'Priority support', 'Custom branding', 'Unlimited analysis history'],
                '{"resumeUploads": 9999, "savedJobDescriptions": 9999, "analysisHistory": 9999, "aiRewrites": true}'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "analysis_results" DROP CONSTRAINT "FK_analysis_results_job_descriptions"`);
        await queryRunner.query(`ALTER TABLE "analysis_results" DROP CONSTRAINT "FK_analysis_results_resumes"`);
        await queryRunner.query(`ALTER TABLE "analysis_results" DROP CONSTRAINT "FK_analysis_results_users"`);
        await queryRunner.query(`ALTER TABLE "job_descriptions" DROP CONSTRAINT "FK_job_descriptions_users"`);
        await queryRunner.query(`ALTER TABLE "resumes" DROP CONSTRAINT "FK_resumes_users"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_subscription_plans"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_users"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "analysis_results"`);
        await queryRunner.query(`DROP TABLE "job_descriptions"`);
        await queryRunner.query(`DROP TABLE "resumes"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }
}