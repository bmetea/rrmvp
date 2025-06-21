import { sql } from "kysely";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create a function to get the next ticket number for a competition
  await sql`
    CREATE OR REPLACE FUNCTION get_next_ticket_number(comp_id UUID)
    RETURNS INTEGER AS $$
    DECLARE
      next_number INTEGER;
      max_ticket INTEGER;
    BEGIN
      -- Get the current maximum ticket number for this competition
      SELECT COALESCE(MAX(ticket_number), 0) INTO max_ticket
      FROM tickets 
      WHERE competition_id = comp_id;
      
      -- Return the next available number
      RETURN max_ticket + 1;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Add a comment to explain the function
  await sql`
    COMMENT ON FUNCTION get_next_ticket_number(UUID) IS 
    'Returns the next available ticket number for a given competition, ensuring sequential allocation'
  `.execute(db);

  // Create a trigger function to automatically set ticket numbers
  await sql`
    CREATE OR REPLACE FUNCTION set_ticket_number()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Only set ticket_number if it's not already provided
      IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := get_next_ticket_number(NEW.competition_id);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Add a comment to explain the trigger function
  await sql`
    COMMENT ON FUNCTION set_ticket_number() IS 
    'Trigger function to automatically set sequential ticket numbers for new tickets'
  `.execute(db);

  // Create the trigger on the tickets table
  await sql`
    CREATE TRIGGER trigger_set_ticket_number
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();
  `.execute(db);

  // Add a comment to explain the trigger
  await sql`
    COMMENT ON TRIGGER trigger_set_ticket_number ON tickets IS 
    'Automatically sets sequential ticket numbers for new tickets based on competition'
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the trigger
  await sql`DROP TRIGGER IF EXISTS trigger_set_ticket_number ON tickets`.execute(
    db
  );

  // Drop the trigger function
  await sql`DROP FUNCTION IF EXISTS set_ticket_number()`.execute(db);

  // Drop the helper function
  await sql`DROP FUNCTION IF EXISTS get_next_ticket_number(UUID)`.execute(db);
}
