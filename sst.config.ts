// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "rr",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const vpc =
      $app.stage === "bmetea"
        ? sst.aws.Vpc.get("rrvpc", "vpc-0c3e161cd446a6dcf")
        : new sst.aws.Vpc("rrvpc", { bastion: true, nat: "ec2", az: 2 });
    const rds = new sst.aws.Aurora("rrdb", {
      vpc,
      engine: "postgres",
      scaling: {
        min: "0 ACU",
        max: "1 ACU",
      },
      dev: {
        username: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!) || 5432,
      },
      // proxy: true,
    });
    // const rds = new sst.aws.Postgres("rrdb", {
    //   vpc,
    // });

    new sst.aws.Nextjs(`rr-${$app.stage}`, {
      link: [rds],
      vpc: vpc,
      server: {
        architecture: "arm64",
      },
      environment: {
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
        CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET!,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
        NEXT_PUBLIC_STRAPI_API_TOKEN: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN!,
        NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL!,
        // Total Processing environment variables
        OPPWA_BASE_URL: process.env.OPPWA_BASE_URL!,
        OPPWA_ENTITY_ID: process.env.OPPWA_ENTITY_ID!,
        OPPWA_ACCESS_TOKEN: process.env.OPPWA_ACCESS_TOKEN!,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
        // Analytics configuration
        NEXT_PUBLIC_ENABLE_ANALYTICS:
          process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || "true",
        NEXT_PUBLIC_SEGMENT_WRITE_KEY:
          process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "",
        NEXT_PUBLIC_GA_TRACKING_ID:
          process.env.NEXT_PUBLIC_GA_TRACKING_ID || "G-TCT192NP1Q",
      },
    });
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
