"use client";

import PrizePage from "@/components/PrizePage";

export default function BreastAugmentationPrizePage() {
  return (
    <PrizePage
      image="/breast-augmentation.png"
      title="Breast Augmentation"
      subtitle="£10,000 Cash Prize for Procedure & Aftercare"
      ticketsSold={90}
      accordionSections={[
        {
          label: "Details",
          content: (
            <>
              <p className="mb-2">
                <span className="font-semibold">Important:</span> This
                competition is subject to specific eligibility, clinic
                requirements, and participant responsibilities. Please read our
                full Terms and Conditions, including{" "}
                <span className="font-semibold">Clause 6</span>, before
                entering.
              </p>
              <ul className="list-disc pl-5 mb-2">
                <li>
                  Win a £10,000 cash prize to fund a breast augmentation
                  procedure.
                </li>
                <li>
                  This amount is intended to cover the surgery, aftercare,
                  travel, accommodation, and any related expenses.
                </li>
                <li>
                  You have full freedom to choose your own licensed clinic in
                  the UK or abroad.
                </li>
                <li>
                  The cash prize is paid directly to you — giving you control
                  over how and where it&apos;s spent.
                </li>
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
                  <li>If you win, you&apos;ll receive a £10,000 cash prize.</li>
                  <li>
                    This cash can be used for your procedure, aftercare, travel,
                    accommodation, or however you choose.
                  </li>
                  <li>
                    You are responsible for booking your consultation and
                    treatment with a licensed provider.
                  </li>
                </ul>
                <h3 className="font-semibold mb-1">
                  Can I choose my own clinic?
                </h3>
                <p className="mb-2">
                  Yes – you are completely free to choose any licensed cosmetic
                  surgery provider (UK or international). We do not restrict
                  your choice.
                </p>
                <h3 className="font-semibold mb-1">
                  Is there a treatment guarantee or support?
                </h3>
                <p className="mb-2">
                  We do not manage or oversee the procedure. You are responsible
                  for selecting your provider and managing your treatment
                  experience.
                </p>
                <h3 className="font-semibold mb-1">
                  Are there any restrictions?
                </h3>
                <ul className="list-disc pl-5">
                  <li>You must be 18 years or older.</li>
                  <li>
                    You must select a licensed medical professional to carry out
                    the procedure.
                  </li>
                  <li>
                    You must follow any medical guidelines issued by your clinic
                    before and after treatment.
                  </li>
                  <li>
                    You are responsible for ensuring you meet the clinic&apos;s
                    eligibility criteria.
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
                  We are not medical professionals and do not offer medical
                  advice, treatment, or recommendations.
                </li>
                <li>
                  The decision to approve treatment lies solely with qualified
                  medical professionals at the selected clinic.
                </li>
                <li>
                  We accept no liability for any treatment outcomes,
                  complications, side effects, or dissatisfaction.
                </li>
                <li>
                  Any additional care, medication, insurance, or follow-up
                  beyond the prize value is your responsibility.
                </li>
                <li>
                  If a cash alternative is available, it may only be taken under
                  the specific conditions outlined above.
                </li>
                <li>
                  You must read and understand the risks involved before
                  undergoing any treatment.
                </li>
                <li>
                  Full Terms and Conditions apply, including Clause 6, which
                  governs eligibility, responsibilities, and limitations of
                  liability.
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
