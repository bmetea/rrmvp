import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Enable UUID extension
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // Create users table (without wallet_id)
  await sql`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      image_url TEXT,
      username VARCHAR(255) UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create wallets table (without foreign key to users)
  await sql`
    CREATE TABLE wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    )
  `.execute(db);

  // Create wallet_transactions table (with number_of_tickets)
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
      number_of_tickets INTEGER DEFAULT 1 CHECK (number_of_tickets > 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
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
      is_wallet_credit BOOLEAN NOT NULL DEFAULT false,
      credit_amount INTEGER CHECK (
        (is_wallet_credit = true AND credit_amount > 0) OR 
        (is_wallet_credit = false AND credit_amount IS NULL)
      ),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create competitions table (with media_info)
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
      media_info JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CHECK (tickets_sold <= total_tickets)
    )
  `.execute(db);

  // Create competition_prizes table (final state with INTEGER[] arrays)
  await sql`
    CREATE TABLE competition_prizes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
      prize_group VARCHAR(255) NOT NULL,
      total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
      available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
      won_quantity INTEGER NOT NULL DEFAULT 0 CHECK (won_quantity >= 0),
      is_instant_win BOOLEAN DEFAULT false,
      phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 3),
      winning_ticket_numbers INTEGER[],
      claimed_winning_tickets INTEGER[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CHECK (available_quantity <= total_quantity),
      CHECK (won_quantity + available_quantity = total_quantity),
      UNIQUE(competition_id, product_id, prize_group, phase)
    )
  `.execute(db);

  // Create payment_transactions table (without competition_id)
  await sql`
    CREATE TABLE payment_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      checkout_id VARCHAR(64) NOT NULL,
      payment_id VARCHAR(64),
      amount NUMERIC NOT NULL,
      currency VARCHAR(3) NOT NULL,
      status_code VARCHAR(32),
      status_description TEXT,
      brand VARCHAR(32),
      payment_type VARCHAR(16),
      raw_prepare_result JSONB,
      raw_status_result JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create competition_entries table (with nullable wallet_transaction_id and payment_transaction_id)
  await sql`
    CREATE TABLE competition_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
      payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create competition_entry_tickets table (with prize_id)
  await sql`
    CREATE TABLE competition_entry_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
      ticket_number INTEGER NOT NULL,
      winning_ticket BOOLEAN NOT NULL DEFAULT FALSE,
      prize_id UUID REFERENCES competition_prizes(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create winning_tickets table
  await sql`
    CREATE TABLE winning_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      prize_id UUID NOT NULL REFERENCES competition_prizes(id) ON DELETE CASCADE,
      ticket_number INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed')),
      claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      claimed_at TIMESTAMP WITH TIME ZONE NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create all indexes
  await sql`CREATE INDEX idx_users_clerk_id ON users(clerk_id)`.execute(db);
  await sql`CREATE INDEX idx_users_email ON users(email)`.execute(db);
  await sql`CREATE INDEX idx_users_username ON users(username)`.execute(db);
  await sql`CREATE INDEX idx_wallets_user_id ON wallets(user_id)`.execute(db);
  await sql`CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competitions_status ON competitions(status)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competitions_dates ON competitions(start_date, end_date)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_prizes_claimed_tickets ON competition_prizes USING GIN (claimed_winning_tickets)`.execute(
    db
  );
  await sql`CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_payment_transactions_checkout_id ON payment_transactions(checkout_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_competition_id ON competition_entries(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_user_id ON competition_entries(user_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entries_wallet_transaction_id ON competition_entries(wallet_transaction_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_competition_entry_id ON competition_entry_tickets(competition_entry_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_competition_id ON competition_entry_tickets(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_ticket_number ON competition_entry_tickets(ticket_number)`.execute(
    db
  );
  await sql`CREATE INDEX idx_competition_entry_tickets_winning_ticket ON competition_entry_tickets(winning_ticket)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winning_tickets_competition_id ON winning_tickets(competition_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winning_tickets_prize_id ON winning_tickets(prize_id)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winning_tickets_ticket_number ON winning_tickets(ticket_number)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winning_tickets_status ON winning_tickets(status)`.execute(
    db
  );
  await sql`CREATE INDEX idx_winning_tickets_claimed_by ON winning_tickets(claimed_by_user_id)`.execute(
    db
  );

  // Create unique constraints
  await sql`CREATE UNIQUE INDEX idx_competition_entry_tickets_unique_ticket ON competition_entry_tickets(competition_id, ticket_number)`.execute(
    db
  );
  await sql`CREATE UNIQUE INDEX idx_winning_tickets_unique_ticket ON winning_tickets(competition_id, ticket_number)`.execute(
    db
  );

  // Create trigger functions
  await sql`
    CREATE OR REPLACE FUNCTION update_competition_entries_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION update_competition_entry_tickets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE OR REPLACE FUNCTION update_winning_tickets_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create triggers
  await sql`
    CREATE TRIGGER trigger_update_competition_entries_updated_at
    BEFORE UPDATE ON competition_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_entries_updated_at();
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_competition_entry_tickets_updated_at
    BEFORE UPDATE ON competition_entry_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_competition_entry_tickets_updated_at();
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transactions_updated_at();
  `.execute(db);

  await sql`
    CREATE TRIGGER trigger_update_winning_tickets_updated_at
    BEFORE UPDATE ON winning_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_winning_tickets_updated_at();
  `.execute(db);

  // Add table comments
  await sql`
    COMMENT ON TABLE competition_entries IS 
    'Stores competition entries - one entry per purchase transaction'
  `.execute(db);

  await sql`
    COMMENT ON TABLE competition_entry_tickets IS 
    'Stores individual tickets for each competition entry'
  `.execute(db);

  await sql`
    COMMENT ON TABLE winning_tickets IS 
    'Tracks individual winning tickets with their status and claim information'
  `.execute(db);

  await sql`
    COMMENT ON COLUMN competition_prizes.claimed_winning_tickets IS 
    'Array of winning ticket numbers that have been claimed by users. These numbers are moved from winning_ticket_numbers when a ticket is won.'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop all triggers
  await sql`DROP TRIGGER IF EXISTS trigger_update_winning_tickets_updated_at ON winning_tickets`.execute(
    db
  );
  await sql`DROP TRIGGER IF EXISTS trigger_update_payment_transactions_updated_at ON payment_transactions`.execute(
    db
  );
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entry_tickets_updated_at ON competition_entry_tickets`.execute(
    db
  );
  await sql`DROP TRIGGER IF EXISTS trigger_update_competition_entries_updated_at ON competition_entries`.execute(
    db
  );

  // Drop all trigger functions
  await sql`DROP FUNCTION IF EXISTS update_winning_tickets_updated_at()`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_payment_transactions_updated_at()`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_competition_entry_tickets_updated_at()`.execute(
    db
  );
  await sql`DROP FUNCTION IF EXISTS update_competition_entries_updated_at()`.execute(
    db
  );

  // Drop all indexes
  await sql`DROP INDEX IF EXISTS idx_winning_tickets_unique_ticket`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_unique_ticket`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_winning_tickets_claimed_by`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winning_tickets_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winning_tickets_ticket_number`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winning_tickets_prize_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_winning_tickets_competition_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_winning_ticket`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_ticket_number`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_competition_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entry_tickets_competition_entry_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entries_wallet_transaction_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competition_entries_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competition_entries_competition_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_payment_transactions_checkout_id`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_payment_transactions_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competition_prizes_claimed_tickets`.execute(
    db
  );
  await sql`DROP INDEX IF EXISTS idx_competitions_dates`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_competitions_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_wallet_transactions_reference`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_wallet_transactions_wallet_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_wallets_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_users_username`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_users_email`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_users_clerk_id`.execute(db);

  // Drop tables in reverse order of dependencies
  await sql`DROP TABLE IF EXISTS winning_tickets`.execute(db);
  await sql`DROP TABLE IF EXISTS competition_entry_tickets`.execute(db);
  await sql`DROP TABLE IF EXISTS competition_entries`.execute(db);
  await sql`DROP TABLE IF EXISTS payment_transactions`.execute(db);
  await sql`DROP TABLE IF EXISTS competition_prizes`.execute(db);
  await sql`DROP TABLE IF EXISTS competitions`.execute(db);
  await sql`DROP TABLE IF EXISTS products`.execute(db);
  await sql`DROP TABLE IF EXISTS wallet_transactions`.execute(db);
  await sql`DROP TABLE IF EXISTS wallets`.execute(db);
  await sql`DROP TABLE IF EXISTS users`.execute(db);
}
