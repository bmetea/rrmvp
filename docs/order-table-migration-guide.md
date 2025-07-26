# Order Table Migration Checklist

## Overview
This checklist outlines the step-by-step process for migrating from the current `wallet_transaction_id` and `payment_transaction_id` system in `competition_entries` to a centralized `order_id` system.

## 🎯 Goals
- [x] Add `orders` table as central order management
- [x] Add `order_id` to: `competition_entries`, `wallet_transactions`, `payment_transactions`
- [ ] Remove `wallet_transaction_id` and `payment_transaction_id` from `competition_entries`
- [ ] Refactor all related code to use order-centric approach

## 📋 Migration Checklist

### Phase 1: Database Schema Changes ✅
- [x] Migration `006_add_orders_table.ts` created
- [x] Adds `orders` table with all required fields
- [x] Adds `order_id` columns to child tables with foreign keys

### Phase 2: Code Refactoring 🔄

#### Step 1: Update Database Types ✅
- [x] Run database migration: `pnpm run db:migrate`
- [x] Generate new types: `pnpm run db:generate-types`

#### Step 2: Update TypeScript Interfaces ✅
- [x] Update `CompetitionEntry` interface in `src/app/(pages)/user/(server)/entry.service.ts`
```typescript
// UPDATE: CompetitionEntry interface
export interface CompetitionEntry {
  id: string;
  competition_id: string;
  user_id: string;
  order_id: string | null;        // ✅ ADD
  // wallet_transaction_id: string | null;    // ❌ REMOVE
  // payment_transaction_id: string | null;   // ❌ REMOVE
  created_at: Date;
  updated_at: Date;
  tickets: number[];
  competition: {
    // ... existing fields
  };
  winning_tickets?: {
    // ... existing fields
  }[];
}
```

#### Step 3: Create Order Management Functions ✅
- [x] Create new file: `src/app/(pages)/checkout/(server)/order.actions.ts`
```typescript
"use server";

import { db } from "@/db";
import { auth } from "@clerk/nextjs/server";

export interface OrderSummary {
  items: Array<{
    competition_id: string;
    competition_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  wallet_amount: number;
  payment_amount: number;
  currency: string;
}

export async function createOrder(
  orderSummary: OrderSummary
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const { userId } = auth();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const order = await db
      .insertInto("orders")
      .values({
        user_id: userId,
        total_amount: orderSummary.total_amount,
        currency: orderSummary.currency,
        status: "pending",
        total_tickets: orderSummary.items.reduce((sum, item) => sum + item.quantity, 0),
        wallet_amount: orderSummary.wallet_amount,
        payment_amount: orderSummary.payment_amount,
        order_summary: orderSummary,
      })
      .returning("id")
      .executeTakeFirst();

    if (!order) {
      return { success: false, error: "Failed to create order" };
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order creation error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "completed" | "failed" | "cancelled"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .updateTable("orders")
      .set({ 
        status,
        updated_at: new Date()
      })
      .where("id", "=", orderId)
      .execute();

    return { success: true };
  } catch (error) {
    console.error("Order status update error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
```

#### Step 4: Update Entry Service Functions ✅
- [x] Update SELECT queries in `src/app/(pages)/user/(server)/entry.service.ts` (lines ~70, 183, 329)
```typescript
// Lines ~70, 183, 329 - FIND and REPLACE:
// OLD:
"ce.wallet_transaction_id",
"ce.payment_transaction_id",

// NEW:
"ce.order_id",
```

- [ ] Update `purchaseCompetitionEntry` function signature in `src/app/(pages)/user/(server)/entry.service.ts`
```typescript
// OLD SIGNATURE:
export async function purchaseCompetitionEntry(
  competitionId: string,
  userId: string,
  walletTransactionId: string | null,
  numberOfTickets: number,
  paymentTransactionId: string | null
): Promise<{
  success: boolean;
  entry?: CompetitionEntry;
  error?: string;
}> {

// NEW SIGNATURE:
export async function purchaseCompetitionEntry(
  competitionId: string,
  userId: string,
  orderId: string,
  numberOfTickets: number
): Promise<{
  success: boolean;
  entry?: CompetitionEntry;
  error?: string;
}> {
```

- [ ] Update INSERT statement in `purchaseCompetitionEntry` (line ~314)
```typescript
// OLD:
const [entry] = await trx
  .insertInto("competition_entries")
  .values({
    competition_id: competitionId,
    user_id: userId,
    wallet_transaction_id: walletTransactionId,    // ❌ REMOVE
    payment_transaction_id: paymentTransactionId,  // ❌ REMOVE
    tickets: ticketNumbers,
  })
  .returningAll()
  .execute();

// NEW:
const [entry] = await trx
  .insertInto("competition_entries")
  .values({
    competition_id: competitionId,
    user_id: userId,
    order_id: orderId,                             // ✅ ADD
    tickets: ticketNumbers,
  })
  .returningAll()
  .execute();
```

#### Step 5: Update Ticket Allocation Functions ✅
- [x] Update `_createCompetitionEntry` function signature in `src/app/(pages)/checkout/(server)/ticket-allocation.actions.ts`
```typescript
// OLD SIGNATURE:
async function _createCompetitionEntry(
  competitionId: string,
  userId: string,
  ticketNumbers: number[],
  walletTransactionId: string | null,
  paymentTransactionId: string | undefined,
  trx: any
): Promise<{ success: boolean; entryId?: string; error?: string }> {

// NEW SIGNATURE:
async function _createCompetitionEntry(
  competitionId: string,
  userId: string,
  ticketNumbers: number[],
  orderId: string,
  trx: any
): Promise<{ success: boolean; entryId?: string; error?: string }> {
```

- [x] Update INSERT statement in `_createCompetitionEntry` (line ~73-74)
```typescript
// OLD:
const competitionEntry = await trx
  .insertInto("competition_entries")
  .values({
    competition_id: competitionId,
    user_id: userId,
    wallet_transaction_id: walletTransactionId,    // ❌ REMOVE
    payment_transaction_id: paymentTransactionId,  // ❌ REMOVE
    tickets: ticketNumbers,
  })
  .returning("id")
  .executeTakeFirst();

// NEW:
const competitionEntry = await trx
  .insertInto("competition_entries")
  .values({
    competition_id: competitionId,
    user_id: userId,
    order_id: orderId,                             // ✅ ADD
    tickets: ticketNumbers,
  })
  .returning("id")
  .executeTakeFirst();
```

- [x] Update `allocateTickets` function signature in `src/app/(pages)/checkout/(server)/ticket-allocation.actions.ts`
```typescript
// OLD SIGNATURE:
export async function allocateTickets(
  items: Array<{
    competition: {
      id: string;
      title: string;
      type: string;
      ticket_price: number;
    };
    quantity: number;
  }>,
  walletTransactionIds: string[],
  paymentTransactionId?: string
): Promise<TicketAllocationResult> {

// NEW SIGNATURE:
export async function allocateTickets(
  items: Array<{
    competition: {
      id: string;
      title: string;
      type: string;
      ticket_price: number;
    };
    quantity: number;
  }>,
  orderId: string
): Promise<TicketAllocationResult> {
```

- [x] Update function call to `_createCompetitionEntry` (line ~250)
```typescript
// OLD:
const entryResult = await _createCompetitionEntry(
  item.competition.id,
  user.id,
  ticketNumbers,
  walletTransactionId,      // ❌ REMOVE
  paymentTransactionId,     // ❌ REMOVE
  trx
);

// NEW:
const entryResult = await _createCompetitionEntry(
  item.competition.id,
  user.id,
  ticketNumbers,
  orderId,                  // ✅ ADD
  trx
);
```

#### Step 6: Update Wallet Payment Functions ✅
- [x] Add `orderId` parameter to `processWalletPayment` function signature in `src/app/(pages)/checkout/(server)/wallet-payment.actions.ts`
- [x] Add `order_id: orderId` to all wallet transaction INSERT statements
```typescript
.values({
  // ... existing fields
  order_id: orderId,  // ✅ ADD
})
```

#### Step 7: Update Real Payment Functions ✅
- [x] Add `order_id: orderId` to all payment transaction INSERT statements in `src/app/(pages)/checkout/(server)/real-payment.actions.ts`
```typescript
.values({
  // ... existing fields
  order_id: orderId,  // ✅ ADD
})
```

#### Step 8: Update Checkout Orchestrator ✅
- [x] Import order functions at top of `src/app/(pages)/checkout/(server)/checkout-orchestrator.actions.ts`
- [x] Create `buildOrderSummary` helper function
- [x] Update `checkout` function to create order first
- [x] Pass `orderId` to all payment and allocation functions
```typescript
// NEW FLOW:
export async function checkout(
  items: CartItem[],
  checkoutId?: string
): Promise<CheckoutResult> {
  try {
    // Step 1: Calculate checkout strategy
    const calculation = await calculateCheckoutStrategy(items);
    if (!calculation.success) {
      return { success: false, error: calculation.error };
    }

    // Step 2: Create order FIRST
    const orderSummary = buildOrderSummary(items, calculation);
    const orderResult = await createOrder(orderSummary);
    if (!orderResult.success) {
      return { success: false, error: orderResult.error };
    }
    const orderId = orderResult.orderId!;

    // Step 3: Process payments with order_id
    if (checkoutId) {
      // ... existing payment verification logic
      
      // Process wallet payment with order_id
      if (recalculation.requiresWalletPayment) {
        const walletPayment = await processWalletPayment(
          items,
          recalculation.walletId!,
          recalculation.walletAmountToUse!,
          orderId  // ✅ PASS ORDER ID
        );
        if (!walletPayment.success) {
          await updateOrderStatus(orderId, "failed");
          return { success: false, error: walletPayment.error };
        }
      }

      // Allocate tickets with order_id
      const allocationResult = await allocateTickets(
        items,
        orderId  // ✅ PASS ORDER ID INSTEAD OF TRANSACTION IDS
      );
      
      if (allocationResult.success) {
        await updateOrderStatus(orderId, "completed");
      } else {
        await updateOrderStatus(orderId, "failed");
      }

      return allocationResult;
    }

    // ... rest of function
  } catch (error) {
    if (orderId) {
      await updateOrderStatus(orderId, "failed");
    }
    // ... error handling
  }
}
```

#### Step 9: Update Admin Competition Actions
- [x] Update SELECT query in `src/app/(pages)/admin/competitions/actions.ts` (lines 658-659)
```typescript
// OLD:
"ce.wallet_transaction_id",
"ce.payment_transaction_id",

// NEW:
"ce.order_id",
```

### Phase 3: Remove Old Columns 🔄
#### Step 10: Create Cleanup Migration
- [ ] Create new file: `db/migrations/007_remove_old_transaction_columns.ts`
- [ ] Run cleanup migration: `pnpm run db:migrate`
- [ ] Generate updated types: `pnpm run db:generate-types`
```typescript
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop old indexes
  await sql`DROP INDEX IF EXISTS idx_competition_entries_wallet_transaction_id`.execute(db);

  // Drop old columns
  await sql`ALTER TABLE competition_entries DROP COLUMN IF EXISTS wallet_transaction_id`.execute(db);
  await sql`ALTER TABLE competition_entries DROP COLUMN IF EXISTS payment_transaction_id`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add columns back
  await sql`ALTER TABLE competition_entries ADD COLUMN wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE RESTRICT`.execute(db);
  await sql`ALTER TABLE competition_entries ADD COLUMN payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL`.execute(db);

  // Recreate indexes
  await sql`CREATE INDEX idx_competition_entries_wallet_transaction_id ON competition_entries(wallet_transaction_id)`.execute(db);
}
```

## 🧪 Testing Checklist

### After Phase 2 (Code Refactoring):
- [x] Database Migration: `pnpm run db:migrate`
- [x] Type Generation: `pnpm run db:generate-types`
- [x] Build Test: `pnpm run build`
- [x] Fix any TypeScript compilation errors
- [x] Test order creation function works
- [x] Test wallet payment with order_id
- [x] Test card payment with order_id
- [x] Test competition entry creation with order_id

### After Phase 3 (Column Removal):
- [ ] Run cleanup migration: `pnpm run db:migrate`
- [ ] Generate final types: `pnpm run db:generate-types`
- [ ] Full build test: `pnpm run build`
- [ ] Test complete checkout flow (wallet + card)
- [ ] Test wallet-only checkout
- [ ] Test card-only checkout
- [ ] Test admin competition entries view
- [ ] Test user entries view
- [ ] Verify order tracking works end-to-end

## ⚠️ Pre-Migration Checklist
- [ ] **Backup Database**: Take full database backup before starting
- [ ] **Test Environment**: Verify changes work in development first
- [ ] **Review Code**: Double-check all file changes before implementing
- [ ] **Rollback Plan**: Ensure old migration files are preserved

## 📋 Completion Checklist
- [ ] **Phase 1**: Database schema completed ✅
- [ ] **Phase 2**: All code refactoring completed
- [ ] **Phase 3**: Old columns removed
- [ ] **Testing**: All tests passing
- [ ] **Documentation**: Update any relevant docs

## 🎯 Benefits After Migration

- ✅ **Centralized Order Management**: Single source of truth for orders
- ✅ **Better Audit Trail**: Complete order history in one place
- ✅ **Simplified Relationships**: Cleaner foreign key structure
- ✅ **Flexible Payments**: Support for complex payment scenarios
- ✅ **Enhanced Reporting**: Order-based analytics and reporting 