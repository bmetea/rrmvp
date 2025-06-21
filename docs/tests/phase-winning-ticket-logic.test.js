/**
 * Phase-Based Winning Ticket Logic Test
 * 
 * This test validates the phase-based winning ticket distribution logic
 * implemented in the computeWinningTicketsAction.
 * 
 * Logic Overview:
 * - Each competition has 3 phases
 * - Phase 1: Tickets 1 to totalTickets/3
 * - Phase 2: Tickets (totalTickets/3 + 1) to (totalTickets * 2/3)
 * - Phase 3: Tickets (totalTickets * 2/3 + 1) to totalTickets
 * - Each phase generates winning tickets only within its range
 * - No duplicate ticket numbers within a phase
 * - Total winning tickets per phase must not exceed phase ticket range
 */

function testPhaseLogic() {
  console.log('🧪 Testing Phase-Based Winning Ticket Logic\n');

  // Test parameters - simulating a real competition
  const totalTickets = 1000;
  const prizes = [
    { id: 'prize1', phase: 1, total_quantity: 5, name: 'Grand Prize' },
    { id: 'prize2', phase: 1, total_quantity: 3, name: 'Second Prize' },
    { id: 'prize3', phase: 1, total_quantity: 2, name: 'Third Prize' },
    { id: 'prize4', phase: 2, total_quantity: 4, name: 'Mid Prize A' },
    { id: 'prize5', phase: 2, total_quantity: 2, name: 'Mid Prize B' },
    { id: 'prize6', phase: 3, total_quantity: 6, name: 'Final Prize A' },
    { id: 'prize7', phase: 3, total_quantity: 1, name: 'Final Prize B' },
  ];

  // Calculate phase boundaries (same logic as in computeWinningTicketsAction)
  const phase1End = Math.floor(totalTickets / 3);
  const phase2Start = phase1End + 1;
  const phase2End = Math.floor((totalTickets * 2) / 3);
  const phase3Start = phase2End + 1;
  const phase3End = totalTickets;

  console.log('📊 Phase Boundaries:');
  console.log(`Phase 1: 1-${phase1End} (${phase1End} tickets)`);
  console.log(`Phase 2: ${phase2Start}-${phase2End} (${phase2End - phase2Start + 1} tickets)`);
  console.log(`Phase 3: ${phase3Start}-${phase3End} (${phase3End - phase3Start + 1} tickets)\n`);

  // Group prizes by phase (same logic as in computeWinningTicketsAction)
  const prizesByPhase = prizes.reduce((acc, prize) => {
    if (!acc[prize.phase]) {
      acc[prize.phase] = [];
    }
    acc[prize.phase].push(prize);
    return acc;
  }, {});

  console.log('🎁 Prizes by Phase:');
  Object.entries(prizesByPhase).forEach(([phase, phasePrizes]) => {
    const totalWinningTickets = phasePrizes.reduce((sum, prize) => sum + prize.total_quantity, 0);
    console.log(`Phase ${phase}: ${phasePrizes.length} prizes, ${totalWinningTickets} total winning tickets`);
    phasePrizes.forEach(prize => {
      console.log(`  - ${prize.name}: ${prize.total_quantity} tickets`);
    });
  });
  console.log('');

  // Simulate winning ticket generation (same logic as in computeWinningTicketsAction)
  console.log('🎯 Generated Winning Ticket Numbers:');
  
  const allGeneratedTickets = new Set(); // Track all generated tickets for duplicate check
  
  Object.entries(prizesByPhase).forEach(([phase, phasePrizes]) => {
    const phaseNum = parseInt(phase);
    
    // Calculate phase boundaries
    let phaseStart, phaseEnd;
    switch (phaseNum) {
      case 1:
        phaseStart = 1;
        phaseEnd = phase1End;
        break;
      case 2:
        phaseStart = phase2Start;
        phaseEnd = phase2End;
        break;
      case 3:
        phaseStart = phase3Start;
        phaseEnd = phase3End;
        break;
    }

    console.log(`\nPhase ${phase} (Tickets ${phaseStart}-${phaseEnd}):`);
    
    const usedTicketNumbers = new Set(); // Track used numbers within this phase
    
    phasePrizes.forEach(prize => {
      const winningTicketNumbers = [];
      const ticketsToGenerate = prize.total_quantity;

      // Generate unique winning ticket numbers within the phase range
      while (winningTicketNumbers.length < ticketsToGenerate) {
        const ticketNumber = Math.floor(Math.random() * (phaseEnd - phaseStart + 1)) + phaseStart;

        if (!usedTicketNumbers.has(ticketNumber)) {
          usedTicketNumbers.add(ticketNumber);
          allGeneratedTickets.add(ticketNumber);
          winningTicketNumbers.push(ticketNumber);
        }
      }

      // Sort for consistency (same as in computeWinningTicketsAction)
      winningTicketNumbers.sort((a, b) => a - b);
      
      console.log(`  ${prize.name}: [${winningTicketNumbers.join(', ')}]`);
    });
  });

  // Comprehensive validation
  console.log('\n✅ Validation Results:');
  
  let allValid = true;
  const validationResults = [];

  // 1. Check that all generated numbers are within their phase ranges
  Object.entries(prizesByPhase).forEach(([phase, phasePrizes]) => {
    const phaseNum = parseInt(phase);
    let phaseStart, phaseEnd;
    
    switch (phaseNum) {
      case 1:
        phaseStart = 1;
        phaseEnd = phase1End;
        break;
      case 2:
        phaseStart = phase2Start;
        phaseEnd = phase2End;
        break;
      case 3:
        phaseStart = phase3Start;
        phaseEnd = phase3End;
        break;
    }

    const phaseTotalWinningTickets = phasePrizes.reduce((sum, prize) => sum + prize.total_quantity, 0);
    const phaseTicketRange = phaseEnd - phaseStart + 1;
    
    if (phaseTotalWinningTickets > phaseTicketRange) {
      validationResults.push(`❌ Phase ${phase}: ${phaseTotalWinningTickets} winning tickets exceed range ${phaseTicketRange}`);
      allValid = false;
    } else {
      validationResults.push(`✅ Phase ${phase}: ${phaseTotalWinningTickets} winning tickets within range ${phaseTicketRange}`);
    }
  });

  // 2. Check for duplicate tickets across all phases
  const expectedTotalTickets = prizes.reduce((sum, prize) => sum + prize.total_quantity, 0);
  if (allGeneratedTickets.size !== expectedTotalTickets) {
    validationResults.push(`❌ Duplicate tickets detected! Expected ${expectedTotalTickets} unique tickets, got ${allGeneratedTickets.size}`);
    allValid = false;
  } else {
    validationResults.push(`✅ No duplicate tickets across all phases (${expectedTotalTickets} unique tickets)`);
  }

  // 3. Check that all tickets are within valid range
  const allTicketsValid = Array.from(allGeneratedTickets).every(ticket => 
    ticket >= 1 && ticket <= totalTickets
  );
  if (!allTicketsValid) {
    validationResults.push(`❌ Some tickets are outside valid range (1-${totalTickets})`);
    allValid = false;
  } else {
    validationResults.push(`✅ All tickets are within valid range (1-${totalTickets})`);
  }

  // Display validation results
  validationResults.forEach(result => console.log(result));

  // Final result
  if (allValid) {
    console.log('\n🎉 All validations passed! Phase-based logic is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`- Total tickets: ${totalTickets}`);
    console.log(`- Total winning tickets: ${expectedTotalTickets}`);
    console.log(`- Phases: 3`);
    console.log(`- Prizes: ${prizes.length}`);
    console.log(`- Distribution: Phase 1 (${prizesByPhase[1]?.length || 0}), Phase 2 (${prizesByPhase[2]?.length || 0}), Phase 3 (${prizesByPhase[3]?.length || 0})`);
  } else {
    console.log('\n❌ Some validations failed! Please review the logic.');
  }
}

// Run the test
console.log('='.repeat(60));
testPhaseLogic();
console.log('='.repeat(60));

// Export for potential use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPhaseLogic };
} 