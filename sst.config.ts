// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

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
    // Use existing VPC for bmetea stage, create new one for others
    const vpc =
      $app.stage === "bmetea"
        ? sst.aws.Vpc.get("rrvpc", "vpc-0c3e161cd446a6dcf")
        : new sst.aws.Vpc("rrvpc", { bastion: true, nat: "ec2", az: 2 });

    // Configure Aurora Serverless v2 database
    const rds = new sst.aws.Aurora("rrdb", {
      vpc,
      engine: "postgres",
      scaling: {
        // Production: min 1 ACU to ensure baseline performance
        // Other stages: min 0 ACU to minimize costs
        min: $app.stage === "prd" ? "1 ACU" : "0 ACU",
        // Production: max 10 ACU for high traffic periods
        // Other stages: max 1 ACU to limit costs
        max: $app.stage === "prd" ? "10 ACU" : "1 ACU",
      },
      // Development configuration for local database connection
      dev: {
        username: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!) || 5432,
      },
      // Enable RDS Proxy in production for better connection management
      proxy: $app.stage === "prd",
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
