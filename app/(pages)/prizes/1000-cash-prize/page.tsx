"use client";

import PrizePage from "@/components/PrizePage";

export default function CashPrizePage() {
  return (
    <PrizePage
      image="/cash-prize.jpg"
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
                <li>Win £1,000 in cash, paid directly to your bank account.</li>
                <li>
                  If you are not eligible, you will receive a consolation prize.
                </li>
                <li>All taxes and reporting are your responsibility.</li>
              </ul>
            </>
          ),
        },
        {
          label: "FAQ",
          content: (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-1">How does it work?</h3>
                <ul className="list-disc pl-5 mb-2">
                  <li>
                    Once you win, we&apos;ll contact you for your bank details.
                  </li>
                  <li>Payment is made within 7 days of confirmation.</li>
                  <li>
                    If you&apos;re not eligible, you&apos;ll receive a
                    consolation prize.
                  </li>
                </ul>
                <h3 className="font-semibold mb-1">
                  Are there any restrictions?
                </h3>
                <ul className="list-disc pl-5">
                  <li>You must be 18 years or older.</li>
                  <li>You must be a UK or Ireland resident.</li>
                  <li>All taxes and reporting are your responsibility.</li>
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
