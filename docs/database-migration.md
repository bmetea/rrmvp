# Database Migration Guide

This guide explains how to run database migrations when the SST tunnel is not working properly.

## Problem

Sometimes the SST tunnel doesn't work properly, preventing database migrations from connecting to the RDS instance.

## Solution: Port Forwarding

Use AWS SSM to create a port forwarding session directly to the RDS cluster.

### Step 1: Set up Port Forwarding

Run the following AWS SSM command to create a port forwarding session:

```bash
aws ssm start-session \
  --target i-03ec16b00873573ac \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters '{"host":["rr-prd-rrdbcluster-ozzuthsv.cluster-c7yw6ysg4zqm.eu-west-1.rds.amazonaws.com"],"portNumber":["5432"],"localPortNumber":["5432"]}'
```

This command:
- Uses the EC2 instance `i-03ec16b00873573ac` as a bastion host
- Forwards local port `5432` to the RDS cluster on port `5432`
- Connects to the RDS cluster endpoint `rr-prd-rrdbcluster-ozzuthsv.cluster-c7yw6ysg4zqm.eu-west-1.rds.amazonaws.com`

### Step 2: Run Migrations with Host Override

Once the port forwarding is active, run the migration with the host override:

```bash
pnpm sst shell --stage ppr pnpm db:migrate host=localhost
```

The `host=localhost` parameter tells the migration script to connect to `localhost` instead of the SST Resource host, which will use the port forwarded connection.

## How It Works

The database connection code in `db/index.ts` has been modified to support a `host` override:

```typescript
// Parse command line arguments for host override
function getHostOverride() {
  const hostArg = process.argv.find(arg => arg.startsWith('host='));
  return hostArg ? hostArg.split('=')[1] : null;
}

// Create a database instance
export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: Resource.rrdb.database,
      host: getHostOverride() || Resource.rrdb.host, // Uses override if provided
      user: Resource.rrdb.username,
      password: Resource.rrdb.password,
      port: Resource.rrdb.port,
      max: 10,
    }),
  }),
});
```

## Complete Process

1. **Start port forwarding session** (keep this terminal open):
   ```bash
   aws ssm start-session \
     --target i-03ec16b00873573ac \
     --document-name AWS-StartPortForwardingSessionToRemoteHost \
     --parameters '{"host":["rr-prd-rrdbcluster-ozzuthsv.cluster-c7yw6ysg4zqm.eu-west-1.rds.amazonaws.com"],"portNumber":["5432"],"localPortNumber":["5432"]}'
   ```

2. **In a new terminal, run the migration**:
   ```bash
   pnpm sst shell --stage ppr pnpm db:migrate host=localhost
   ```

3. **Stop the port forwarding session** when done (Ctrl+C in the first terminal)

## Troubleshooting

- **Port already in use**: Make sure no other process is using port 5432 locally
- **Permission denied**: Ensure you have the necessary AWS SSM permissions
- **Connection timeout**: Verify the EC2 instance ID and RDS endpoint are correct
- **Migration fails**: Check that all SST resources are properly loaded in the shell environment

## Other Database Scripts

This same approach works for other database scripts:

```bash
# Revert migrations
pnpm sst shell --stage ppr pnpm db:revert host=localhost

# Revert all migrations  
pnpm sst shell --stage ppr pnpm db:revert-all host=localhost
``` 