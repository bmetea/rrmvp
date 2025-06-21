# Tests Documentation

This directory contains test files for validating critical business logic in the application.

## Phase Winning Ticket Logic Test

**File:** `phase-winning-ticket-logic.test.js`

### Purpose
This test validates the phase-based winning ticket distribution logic implemented in the `computeWinningTicketsAction`. It ensures that:

1. **Phase Boundaries**: Each phase has the correct ticket range
2. **No Duplicates**: No duplicate ticket numbers within or across phases
3. **Range Validation**: All winning tickets fall within their designated phase ranges
4. **Quantity Validation**: Total winning tickets per phase don't exceed the phase ticket range

### Running the Test

```bash
node docs/tests/phase-winning-ticket-logic.test.js
```

### Expected Output

The test will output:
- Phase boundaries and ticket ranges
- Prize distribution across phases
- Generated winning ticket numbers for each prize
- Validation results
- Summary statistics

### Test Logic

The test simulates the exact same logic used in `computeWinningTicketsAction`:

```javascript
// Phase boundaries calculation
const phase1End = Math.floor(totalTickets / 3);
const phase2Start = phase1End + 1;
const phase2End = Math.floor((totalTickets * 2) / 3);
const phase3Start = phase2End + 1;
const phase3End = totalTickets;

// Phase ranges
// Phase 1: 1 to totalTickets/3
// Phase 2: (totalTickets/3 + 1) to (totalTickets * 2/3)
// Phase 3: (totalTickets * 2/3 + 1) to totalTickets
```

### Validation Checks

1. **Phase Range Validation**: Ensures winning tickets are within their phase boundaries
2. **Duplicate Detection**: Verifies no duplicate ticket numbers across all phases
3. **Total Range Validation**: Confirms all tickets are within the overall competition range
4. **Quantity Validation**: Checks that phase winning tickets don't exceed available tickets

### Use Cases

- **Development**: Run during development to validate logic changes
- **Regression Testing**: Ensure new changes don't break existing functionality
- **Documentation**: Provides clear examples of how the phase logic works
- **Debugging**: Helps identify issues with winning ticket generation

### Example Competition Setup

The test uses a sample competition with:
- **Total Tickets**: 1000
- **Phases**: 3
- **Prizes**: 7 (distributed across phases)
- **Total Winning Tickets**: 23

This provides a realistic scenario for testing the phase-based distribution logic.

### Integration with Main Logic

The test logic mirrors the implementation in:
- `app/(pages)/admin/competitions/actions.ts` - `computeWinningTicketsAction`
- `app/(pages)/admin/competitions/competition-dialog.tsx` - Phase display logic

Any changes to the main logic should be reflected in this test to maintain consistency. 