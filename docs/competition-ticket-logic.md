# Competition Ticket and Prize Distribution Logic

## Overview
This document outlines the logic for managing competition tickets and prize distribution across three phases.

## Competition Structure

### Core Properties
- **competition_total_tickets**: Total number of tickets available for the competition
- **competition_phase_number**: Number of phases (always 3)
- **phase_total_winning_tickets**: Total winning tickets per phase

### Phase Breakdown
Each competition is divided into 3 phases, each representing 1/3 of the total tickets:

- **Phase 1**: Tickets 1 to `competition_total_tickets * 1/3`
- **Phase 2**: Tickets `competition_total_tickets * 1/3 + 1` to `competition_total_tickets * 2/3`
- **Phase 3**: Tickets `competition_total_tickets * 2/3 + 1` to `competition_total_tickets`

## Prize Distribution Logic

### Phase Total Calculation
For each phase, the total winning tickets is calculated as:
```
phase_total_winning_tickets = sum(prize1_winning_ticket_qty, prize2_winning_ticket_qty, prize3_winning_ticket_qty, ...)
```

### Winning Ticket Number Generation

#### Phase 1
- **Range**: 1 to `competition_total_tickets * 1/3`
- **Example**: For 1000 total tickets → Range: 1-333

#### Phase 2  
- **Range**: `competition_total_tickets * 1/3 + 1` to `competition_total_tickets * 2/3`
- **Example**: For 1000 total tickets → Range: 334-666

#### Phase 3
- **Range**: `competition_total_tickets * 2/3 + 1` to `competition_total_tickets`
- **Example**: For 1000 total tickets → Range: 667-1000

## Example Implementation

### Sample Competition
- **Total Tickets**: 1000
- **Phases**: 3
- **Prizes per Phase**:
  - Prize 1: 5 winning tickets
  - Prize 2: 3 winning tickets
  - Prize 3: 2 winning tickets
  - **Total per Phase**: 10 winning tickets

### Generated Winning Ticket Numbers

#### Phase 1 (Tickets 1-333)
- **Prize 1**: [45, 127, 89, 234, 156]
- **Prize 2**: [78, 201, 312]
- **Prize 3**: [167, 298]

#### Phase 2 (Tickets 334-666)
- **Prize 1**: [456, 389, 523, 445, 612]
- **Prize 2**: [478, 567, 401]
- **Prize 3**: [512, 634]

#### Phase 3 (Tickets 667-1000)
- **Prize 1**: [789, 723, 856, 912, 678]
- **Prize 2**: [745, 823, 901]
- **Prize 3**: [767, 889]

## Implementation Rules

### Constraints
1. **No Duplicates**: Each ticket number can only be used once per phase
2. **Range Validation**: All generated numbers must fall within the phase's ticket range
3. **Sum Validation**: Total winning tickets across all prizes must equal `phase_total_winning_tickets`
4. **Random Distribution**: Ticket numbers are randomly generated within each phase's range

### Database Considerations
- Store winning ticket numbers as arrays or JSON for each prize
- Maintain phase boundaries for validation
- Track which tickets have been assigned to prevent duplicates
- Consider indexing for efficient ticket number lookups

### Validation Logic
```typescript
// Pseudo-code for validation
function validatePhaseTickets(phase: number, totalTickets: number, winningTickets: number[]) {
  const phaseStart = Math.floor((phase - 1) * totalTickets / 3) + 1
  const phaseEnd = Math.floor(phase * totalTickets / 3)
  
  return winningTickets.every(ticket => 
    ticket >= phaseStart && ticket <= phaseEnd
  )
}
```

## Implementation Status

### ✅ Completed Features

#### Backend Implementation
- **File**: `app/(pages)/admin/competitions/actions.ts`
- **Function**: `computeWinningTicketsAction`
- **Features**:
  - Phase-based ticket range calculation
  - Random winning ticket generation within phase boundaries
  - Duplicate prevention within phases
  - Validation of phase ticket limits
  - Detailed success response with phase information

#### Frontend Implementation
- **File**: `app/(pages)/admin/competitions/competition-dialog.tsx`
- **Features**:
  - Phase distribution summary display
  - Real-time phase range calculation
  - Winning ticket number display for each prize
  - Enhanced success feedback with phase details
  - Visual indicators for locked/unlocked states

#### Testing
- **File**: `docs/tests/phase-winning-ticket-logic.test.js`
- **Features**:
  - Comprehensive validation of phase logic
  - Duplicate detection across phases
  - Range validation for all phases
  - Real-world competition simulation
  - Detailed output for debugging

### 🔧 Technical Details

#### Phase Boundary Calculation
```typescript
const phase1End = Math.floor(totalTickets / 3);
const phase2Start = phase1End + 1;
const phase2End = Math.floor((totalTickets * 2) / 3);
const phase3Start = phase2End + 1;
const phase3End = totalTickets;
```

#### Winning Ticket Generation
```typescript
// Generate unique winning ticket numbers within the phase range
while (winningTicketNumbers.length < ticketsToGenerate) {
  const ticketNumber = Math.floor(Math.random() * (phaseEnd - phaseStart + 1)) + phaseStart;
  
  if (!usedTicketNumbers.has(ticketNumber)) {
    usedTicketNumbers.add(ticketNumber);
    winningTicketNumbers.push(ticketNumber);
  }
}
```

#### Validation Checks
1. **Phase Range Validation**: Ensures tickets are within phase boundaries
2. **Duplicate Prevention**: No duplicate tickets within a phase
3. **Quantity Validation**: Phase winning tickets don't exceed available tickets
4. **Total Range Validation**: All tickets within overall competition range

### 🎯 User Experience

#### Admin Interface
- **Phase Distribution Summary**: Shows ticket ranges for all phases
- **Real-time Feedback**: Displays winning ticket numbers after computation
- **Visual Indicators**: Clear status for locked/unlocked prize editing
- **Detailed Success Messages**: Shows phase distribution statistics

#### Error Handling
- **Validation Errors**: Clear error messages for invalid configurations
- **Phase Limit Errors**: Warnings when phase winning tickets exceed range
- **Competition Type Validation**: Only instant win competitions support this feature

## Use Cases

### Ticket Purchase Flow
1. User purchases ticket(s)
2. System assigns sequential ticket numbers
3. Check if purchased ticket numbers match any winning numbers
4. Award prizes based on phase and ticket number matches

### Prize Distribution
1. Generate winning ticket numbers when competition ends
2. Distribute prizes based on ticket number matches
3. Handle multiple winners per prize category
4. Track prize distribution for audit purposes

### Admin Management
1. Create competition with phase-based prize structure
2. Compute winning tickets using phase distribution logic
3. View detailed phase information and winning ticket numbers
4. Override and recompute winning tickets if needed

## Future Considerations

### Scalability
- Consider batch processing for large ticket volumes
- Implement efficient random number generation algorithms
- Optimize database queries for ticket number lookups

### Security
- Use cryptographically secure random number generation
- Implement audit trails for ticket number generation
- Validate ticket numbers against tampering

### Monitoring
- Track ticket distribution patterns
- Monitor prize distribution fairness
- Log all winning ticket number generations

### Testing
- Run `node docs/tests/phase-winning-ticket-logic.test.js` to validate logic
- Add integration tests for admin interface
- Implement automated testing for edge cases 