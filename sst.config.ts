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
        ? sst.aws.Vpc.get("rrvpc", "vpc-02bea4187a58d4356")
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
        port: parseInt(process.env.DB_PORT!)|| 5432,
      },
      proxy: true,
    });

    new sst.aws.Nextjs(`rr-${$app.stage}`, {
      link: [rds],
      vpc: vpc,
      environment: {
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
        NEXT_PUBLIC_STRAPI_API_TOKEN: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN!,
        NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL!,
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
