// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

// Stage-specific configurations
const stageConfigs = {
  prd: {
    vpc: {
      create: true,
      nat: "managed" as const,
      bastion: true,
      az: 2,
    },
    aurora: {
      minACU: "1 ACU",
      maxACU: "10 ACU",
      proxy: true,
    },
  },
  ppr: {
    vpc: {
      create: true,
      nat: "ec2" as const,
      bastion: true,
      az: 2,
    },
    aurora: {
      minACU: "0 ACU",
      maxACU: "1 ACU",
      proxy: false,
    },
  },
  bmetea: {
    vpc: {
      create: false,
      existingVpcId: "vpc-0c3e161cd446a6dcf",
    },
    aurora: {
      minACU: "0 ACU",
      maxACU: "1 ACU",
      proxy: false,
    },
  },
} as const;

export default $config({
  app(input) {
    return {
      name: "rr",
      // Retain infrastructure in production, remove in other stages
      removal: input?.stage === "prd" ? "retain" : "remove",
      // Protect production stage from accidental deletion
      protect: ["prd"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    // Get stage-specific configuration, defaulting to 'ppr' for unknown stages
    const config =
      stageConfigs[$app.stage as keyof typeof stageConfigs] || stageConfigs.ppr;

    // Create or get VPC based on stage configuration
    const vpc = config.vpc.create
      ? new sst.aws.Vpc("rrvpc", {
          bastion: config.vpc.bastion,
          nat: config.vpc.nat,
          az: config.vpc.az,
        })
      : sst.aws.Vpc.get("rrvpc", config.vpc.existingVpcId!);

    // Configure Aurora Serverless v2 database
    const rds = new sst.aws.Aurora("rrdb", {
      vpc,
      engine: "postgres",
      scaling: {
        min: config.aurora.minACU,
        max: config.aurora.maxACU,
      },
      // Development configuration for local database connection
      dev: {
        username: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!) || 5432,
      },
      // Enable RDS Proxy based on stage configuration
      proxy: config.aurora.proxy,
    });

    // Deploy Next.js application with stage-specific name
    new sst.aws.Nextjs(`rr-${$app.stage}`, {
      link: [rds],
      vpc: vpc,
      server: {
        architecture: "arm64", // Using ARM for better cost/performance
      },
      environment: {
        // Authentication configuration
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
        CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET!,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
        // Total Processing environment variables
        OPPWA_BASE_URL: process.env.OPPWA_BASE_URL!,
        OPPWA_ENTITY_ID: process.env.OPPWA_ENTITY_ID!,
        OPPWA_ACCESS_TOKEN: process.env.OPPWA_ACCESS_TOKEN!,
        // Analytics configuration with defaults
        NEXT_PUBLIC_ENABLE_ANALYTICS:
          process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || "true",
        NEXT_PUBLIC_SEGMENT_WRITE_KEY:
          process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "",
        NEXT_PUBLIC_GA_TRACKING_ID:
          process.env.NEXT_PUBLIC_GA_TRACKING_ID || "G-TCT192NP1Q",
      },
    });

    // Return infrastructure information for external use
    return {
      vpc: vpc.id,
      dbArn: rds.clusterArn,
      dbUsername: rds.username,
      dbPassword: rds.password,
      dbHost: rds.host,
      dbPort: rds.port,
      dbDatabase: rds.database,
    };
  },
});
