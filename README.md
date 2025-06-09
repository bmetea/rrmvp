## TODO
- only allow checkout if you're logged in
- make a buy button on the checkout page
- when you click buy, if you have enough credit into your account it should work properly with db inserts.


## Notes

### Using Other db stage on sst dev
- If you want to use PPR db when you run `sst dev` you need to use the PPR vpc
- Then in the RDS dev property pass in the PPR details.

### DB Migrations

- `pnpm sst shell --stage ppr pnpm db:migrate` 
- `pnpm sst shell --stage ppr pnpm db:revert` 
- `pnpm sst shell --stage ppr pnpm db:revert_all` 
- `migrate": "tsx scripts/migrate.ts`

### SSM Bastion

https://medium.com/@rajputmanish061/how-to-access-aws-rds-via-bastion-host-using-ssm-plu-93d6c4f2bb08

- on local machine to connect to the bastion
    - `aws ssm start-session --target i-06f1f927361315d42 --region eu-west-1`
    - `aws ssm start-session --target i-06f1f927361315d42 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["5432"], "localPortNumber":["5433"]}' --region eu-west-1`
- on bastion to do the forwarding
  - `socat TCP-LISTEN:5432,reuseaddr,fork TCP4:rr-ppr-rrdbproxy-ufbkzhwo.proxy-c7yw6ysg4zqm.eu-west-1.rds.amazonaws.com:5432`


### SST Tunnel

- `pnpm sst shell --stage ppr sst tunnel`
- dupa care folosesti exact detaliile din output



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
