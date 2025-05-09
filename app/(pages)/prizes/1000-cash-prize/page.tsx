"use client";

import PrizePage from "@/components/layout/PrizePage";

export default function CashPrizePage() {
  return (
    <PrizePage
      image="/cash-prize.png"
      title="£1,000 Cash Prize"
      subtitle="Win £1,000 in cash, paid directly to your bank account."
      ticketsSold={75}
      accordionSections={[
        {
          label: "Details",
          content: (
            <>
              <p className="mb-2">
                <span className="font-semibold">Important:</span> This
                competition is subject to specific eligibility and participant
                responsibilities. Please read our full Terms and Conditions
                before entering.
              </p>
              <ul className="list-disc pl-5 mb-2">
                <li>Step 1: Enter the competition.</li>
                <li>
                  Step 2: If you win, we&apos;ll contact you to confirm your
                  payment details.
                </li>
                <li>
                  Step 3: Your winnings will be sent instantly after
                  confirmation.
                </li>
              </ul>
            </>
          ),
        },
        {
          label: "Payment Methods Available",
          content: (
            <>
              <ul className="list-disc pl-5 mb-2">
                <li>Bank Transfer (UK & International)</li>
                <li>PayPal</li>
                <li>Revolut / Monzo / Other Digital Banking</li>
              </ul>
            </>
          ),
        },
        {
          label: "FAQ",
          content: (
            <>
              <div className="mb-4">
                <ul className="list-disc pl-5 mb-2">
                  <li className="mb-4">
                    <span className="font-semibold">
                      When will I receive my cash prize?
                    </span>
                    <p>Instantly after confirming your payment details.</p>
                  </li>
                  <li className="mb-4">
                    <span className="font-semibold">
                      Can I receive my winnings in another currency?
                    </span>
                    <p>
                      Yes — we&apos;ll transfer the equivalent of £1,000 in your
                      local currency at the current exchange rate.
                    </p>
                  </li>
                  <li className="mb-4">
                    <span className="font-semibold">
                      Are there any restrictions on how I use my winnings?
                    </span>
                    <p>
                      None. Once received, the money is yours to use freely.
                    </p>
                  </li>
                </ul>
              </div>
            </>
          ),
        },
        {
          label: "Disclaimer & Liability Waiver",
          content: (
            <>
              <p className="mb-2">
                By entering this competition, you acknowledge and agree to the
                following:
              </p>
              <ul className="list-disc pl-5 mb-2">
                <li>
                  We are not responsible for any delays or issues with bank
                  transfers.
                </li>
                <li>
                  You must provide accurate information to receive your prize.
                </li>
                <li>Full Terms and Conditions apply.</li>
              </ul>
              <p>If you have any questions, please contact us.</p>
            </>
          ),
        },
      ]}
    />
  );
}
