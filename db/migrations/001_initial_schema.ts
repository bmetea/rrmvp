import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Enable UUID extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // Create users table
  await sql`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      image_url TEXT,
      username VARCHAR(255) UNIQUE,
      wallet_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create wallets table
  await sql`
    CREATE TABLE wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    )
  `.execute(db);

  // Create wallet_transactions table
  await sql`
    CREATE TABLE wallet_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
      amount INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit')),
      status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('ticket_purchase', 'top_up', 'refund', 'prize_win')),
      reference_id UUID,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create indexes for wallet transactions
  await sql`CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id)`.execute(
    db
  );

  // Add foreign key constraint for wallet_id
  await sql`
    ALTER TABLE users 
    ADD CONSTRAINT fk_users_wallet 
    FOREIGN KEY (wallet_id) 
    REFERENCES wallets(id) 
    ON DELETE RESTRICT
  `.execute(db);

  // Create products table
  await sql`
    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      sub_name VARCHAR(255),
      market_value INTEGER NOT NULL CHECK (market_value >= 0),
      description TEXT,
      media_info JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create competitions table
  await sql`
    CREATE TABLE competitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      ticket_price INTEGER NOT NULL CHECK (ticket_price >= 0),
      status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
      type VARCHAR(50) NOT NULL CHECK (type IN ('raffle', 'instant_win')),
      total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
      tickets_sold INTEGER NOT NULL DEFAULT 0 CHECK (tickets_sold >= 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CHECK (tickets_sold <= total_tickets)
    )
  `.execute(db);

  // Create competition_prizes table
  await sql`
    CREATE TABLE competition_prizes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
      prize_group VARCHAR(255) NOT NULL, -- e.g., 'cash_prize', 'headline_prize', 'beauty_bundle'
      total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
      available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
      won_quantity INTEGER NOT NULL DEFAULT 0 CHECK (won_quantity >= 0),
      is_instant_win BOOLEAN DEFAULT false,
      phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 3),
      min_ticket_percentage DECIMAL(5,2) NOT NULL CHECK (min_ticket_percentage >= 0 AND min_ticket_percentage <= 100),
      max_ticket_percentage DECIMAL(5,2) NOT NULL CHECK (max_ticket_percentage >= 0 AND max_ticket_percentage <= 100),
      winning_ticket_numbers TEXT[], -- Array of pre-generated winning ticket numbers for instant win
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CHECK (available_quantity <= total_quantity),
      CHECK (min_ticket_percentage <= max_ticket_percentage),
      CHECK (won_quantity + available_quantity = total_quantity),
      UNIQUE(competition_id, product_id, prize_group, phase) -- Ensures unique combination of product in each phase
    )
  `.execute(db);

  // Create tickets table
  await sql`
    CREATE TABLE tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'used', 'expired')),
      ticket_number VARCHAR(50) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create winners table
  await sql`
    CREATE TABLE winners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID REFERENCES tickets(id) ON DELETE RESTRICT,
      competition_prize_id UUID REFERENCES competition_prizes(id) ON DELETE RESTRICT,
      won_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'claimed', 'delivered')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create indexes for better query performance
  await sql`CREATE INDEX idx_users_clerk_id ON users(clerk_id)`.execute(db);
  await sql`CREATE INDEX idx_users_email ON users(email)`.execute(db);
  await sql`CREATE INDEX idx_users_username ON users(username)`.execute(db);
  await sql`CREATE INDEX idx_wallets_user_id ON wallets(user_id)`.execute(db);
  await sql`CREATE INDEX idx_competitions_status ON competitions(status)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date)`.execute(
    db
  );
  await sql`CREATE INDEX idx_tickets_user_id ON tickets(user_id)`.execute(db);
  await sql`CREATE INDEX idx_tickets_competition_id ON tickets(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winners_ticket_id ON winners(ticket_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winners_status ON winners(status)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // First drop all foreign key constraints
  await sql`ALTER TABLE winners DROP CONSTRAINT IF EXISTS winners_ticket_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE winners DROP CONSTRAINT IF EXISTS winners_competition_prize_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_competition_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_user_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE competition_prizes DROP CONSTRAINT IF EXISTS competition_prizes_competition_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE competition_prizes DROP CONSTRAINT IF EXISTS competition_prizes_product_id_fkey`.execute(
    db
  );
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_wallet`.execute(
    db
  );
  await sql`ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey`.execute(
    db
  );

  // Drop all indexes
  await sql`DROP INDEX IF EXISTS idx_winners_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winners_ticket_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_competition_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_tickets_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competitions_dates`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competitions_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_wallets_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_users_username`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_users_email`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_users_clerk_id`.execute(db);

  // Now drop tables in reverse order
  await sql`DROP TABLE IF EXISTS winners`.execute(db);
  await sql`DROP TABLE IF EXISTS tickets`.execute(db);
  await sql`DROP TABLE IF EXISTS competition_prizes`.execute(db);
  await sql`DROP TABLE IF EXISTS competitions`.execute(db);
  await sql`DROP TABLE IF EXISTS products`.execute(db);
  await sql`DROP TABLE IF EXISTS wallets`.execute(db);
  await sql`DROP TABLE IF EXISTS wallet_transactions`.execute(db);
  await sql`DROP TABLE IF EXISTS users`.execute(db);
}
