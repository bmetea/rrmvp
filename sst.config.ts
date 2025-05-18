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
        ? sst.aws.Vpc.get("rrvpc", "vpc-04fd98d66f5629a63")
        : new sst.aws.Vpc("rrvpc", { bastion: true, nat: "ec2", az: 1 });
    const rds = new sst.aws.Aurora("rrdb", {
      vpc,
      engine: "postgres",
      scaling: {
        min: "0 ACU",
        max: "1 ACU",
      },
      dev: {
        username: "postgres",
        password: "postgres",
        database: "postgres",
        host: "localhost",
        port: 5432,
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
