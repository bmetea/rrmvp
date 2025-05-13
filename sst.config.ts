// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "rr-mvp",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("MyWeb", {
      domain: {
        name: "radiancerewards.co.uk",
        aliases: ["www.radiancerewards.co.uk"],
        cert: "arn:aws:acm:us-east-1:976193254361:certificate/21ef90b9-ef7c-4e87-87cb-3c777047f08b",
        dns: false,
      },
    });
  },
});
