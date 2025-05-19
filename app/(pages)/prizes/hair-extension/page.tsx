"use client";

import PrizePage from "@/components/PrizePage";

export default function HairExtensionPrizePage() {
  return (
    <PrizePage
      image="/hair-extension.jpg"
      title="Beauty Works Hair Extensions"
      subtitle="£1,000 Store Credit or £1,000 Cash Alternative"
      ticketsSold={85}
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
                <li>
                  Win a £1,000 store credit to spend at Beauty Works Online, the
                  UK&apos;s leading luxury hair extensions brand.
                </li>
                <li>
                  Choose from their full range of award-winning products,
                  including:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Celebrity Choice Wefts</li>
                    <li>Invisi® Tape Extensions</li>
                    <li>Clip-in Extensions</li>
                    <li>Remy Human Hair Ponytails</li>
                    <li>Styling Tools & Aftercare Products</li>
                  </ul>
                </li>
                <li>Or opt for the £1,000 cash alternative.</li>
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
                    Once you win, we will provide you with a unique £1,000
                    voucher code for Beauty Works Online.
                  </li>
                  <li>
                    You can use the voucher to purchase any products available
                    on their website.
                  </li>
                  <li>
                    If you prefer, you can choose the £1,000 cash alternative
                    instead.
                  </li>
                </ul>
                <h3 className="font-semibold mb-1">
                  Can I use the voucher in physical salons?
                </h3>
                <p className="mb-2">
                  No, the voucher is valid exclusively for online purchases at
                  Beauty Works Online.
                </p>
                <h3 className="font-semibold mb-1">
                  Are there any restrictions?
                </h3>
                <ul className="list-disc pl-5">
                  <li>
                    The voucher must be used within 12 months of issuance.
                  </li>
                  <li>
                    The voucher is non-transferable and cannot be exchanged for
                    cash.
                  </li>
                  <li>You must be over 18 years old to claim this prize.</li>
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
                By participating in this competition, you acknowledge and agree
                to the following:
              </p>
              <ul className="list-disc pl-5 mb-2">
                <li>
                  We are not affiliated with Beauty Works and do not provide any
                  guarantees regarding their products or services.
                </li>
                <li>
                  The voucher is subject to Beauty Works&apos; terms and
                  conditions.
                </li>
                <li>
                  We accept no liability for the results of any products
                  purchased, including dissatisfaction with the outcome.
                </li>
                <li>
                  If you opt for the cash alternative, it is your choice how you
                  use the funds.
                </li>
                <li>
                  You must read and understand the risks before proceeding with
                  any purchases.
                </li>
              </ul>
              <p>If you have any questions, please contact us.</p>
            </>
          ),
        },
      ]}
    />
  );
}
