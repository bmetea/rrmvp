"use client";

import PrizePage from "@/components/PrizePage";

export default function BreastAugmentationPrizePage() {
  return (
    <PrizePage
      image="/breast-augmentation.jpg"
      title="Breast Augmentation"
      subtitle="+ £2,000 Aftercare or £15,000 Cash Alternative"
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
                  Includes a fully paid consultation and up to £2,000 for
                  follow-up aftercare.
                </li>
                <li>
                  If the clinic determines you are not medically eligible, you
                  will receive the £15,000 cash alternative.
                </li>
                <li>
                  Travel, accommodation, and any associated costs are your
                  responsibility.
                </li>
                <li>
                  All procedures are carried out by reputable, approved partner
                  clinics (listed below).
                </li>
              </ul>
            </>
          ),
        },
        {
          label: "Approved Partner Clinics",
          content: (
            <>
              <ul className="list-disc pl-5 mb-2">
                <li>
                  <a
                    href="https://www.topdoctors.co.uk/doctor/plastic-surgery/breast-augmentation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    Top UK Plastic Surgeons for Breast Augmentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://cosmetic.transforminglives.co.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    Transform Cosmetic Surgery
                  </a>
                </li>
                <li>
                  <a
                    href="https://harleyclinic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    Harley Clinic
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.bupa.co.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    Bupa Cosmetic Surgery
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nuffieldhealth.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700"
                  >
                    Nuffield Health
                  </a>
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-2">
                All partner clinics are selected based on their qualifications,
                safety record, and medical reputation.
              </p>
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
                    Once you win, we&apos;ll confirm your preferred clinic from
                    our approved list.
                  </li>
                  <li>Your initial consultation will be fully paid by us.</li>
                  <li>
                    If eligible, we cover the cost of treatment up to the full
                    prize value.
                  </li>
                  <li>
                    If you&apos;re not eligible, you&apos;ll receive the cash
                    alternative.
                  </li>
                </ul>
                <h3 className="font-semibold mb-1">
                  Where can I go for treatment?
                </h3>
                <p className="mb-2">
                  Treatment must take place at one of our{" "}
                  <span className="font-semibold">
                    approved partner clinics
                  </span>{" "}
                  listed above.
                </p>
                <h3 className="font-semibold mb-1">
                  What happens if I&apos;m declined for treatment?
                </h3>
                <p className="mb-2">
                  If you&apos;re found medically ineligible, you&apos;ll
                  automatically receive the £15,000 cash alternative.
                  <br />
                  However, if you fail to disclose important medical information
                  or do not meet the clinic&apos;s stated criteria, you may
                  forfeit the prize without alternative.
                </p>
                <h3 className="font-semibold mb-1">
                  Can I choose my own provider?
                </h3>
                <p className="mb-2">
                  No. Treatment must be conducted at an approved partner clinic
                  to ensure compliance and safety standards.
                </p>
                <h3 className="font-semibold mb-1">
                  Are there any restrictions?
                </h3>
                <ul className="list-disc pl-5">
                  <li>You must be 18 years or older.</li>
                  <li>All procedures are subject to medical assessment.</li>
                  <li>
                    You must follow pre-treatment and post-treatment guidance
                    issued by the clinic.
                  </li>
                  <li>
                    You are responsible for all travel, accommodation, and
                    related expenses.
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
