import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | Radiance Rewards",
  description: "Acceptable Use Policy for Radiance Rewards website",
};

export default function AcceptableUsePolicyPage() {
  return (
    <main>
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold">
                Acceptable Use Policy
              </CardTitle>
              <p className="text-gray-600">Last updated: April 2025</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
              <p>
                This acceptable use policy sets out the terms between you and us
                under which you may access our website www.radiancerewards.co.uk
                (our site). This acceptable use policy applies to all users of,
                and visitors to, our site.
              </p>
              <p>
                Your use of our site means that you accept, and agree to abide
                by, all the policies in this acceptable use policy, which
                supplement our terms of website use.
              </p>
              <p>
                www.radiancerewards.co.uk is a site operated by Claravue Ltd
                trading as Radiance Rewards (we or us). We are registered in
                England and Wales under company number 16388957 and we have our
                registered office at Oakfields Farm, Kingsland, Herefordshire,
                HR6 9QU.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4">
                2. Prohibited uses
              </h2>
              <p>
                You may use our site only for lawful purposes. You may not use
                our site:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  In any way that breaches any applicable local, national or
                  international law or regulation.
                </li>
                <li>
                  In any way that is unlawful or fraudulent, or has any unlawful
                  or fraudulent purpose or effect.
                </li>
                <li>
                  For the purpose of harming or attempting to harm minors in any
                  way.
                </li>
                <li>
                  To send, knowingly receive, upload, download, use or re-use
                  any material which does not comply with our content standards.
                </li>
                <li>
                  To transmit, or procure the sending of, any unsolicited or
                  unauthorised advertising or promotional material or any other
                  form of similar solicitation (spam).
                </li>
                <li>
                  To knowingly transmit any data, send or upload any material
                  that contains viruses, Trojan horses, worms, time-bombs,
                  keystroke loggers, spyware, adware or any other harmful
                  programs or similar computer code designed to adversely affect
                  the operation of any computer software or hardware.
                </li>
              </ul>
              <p>You also agree:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Not to reproduce, duplicate, copy or re-sell any part of our
                  site in contravention of the provisions of our terms of
                  website use.
                </li>
                <li>
                  Not to access without authority, interfere with, damage or
                  disrupt:
                </li>
                <ul className="list-disc pl-6 mb-4">
                  <li>any part of our site;</li>
                  <li>any equipment or network on which our site is stored;</li>
                  <li>any software used in the provision of our site; or</li>
                  <li>
                    any equipment or network or software owned or used by any
                    third party.
                  </li>
                </ul>
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4">
                3. Interactive services
              </h2>
              <p>
                We may from time to time provide interactive services on our
                site, including, without limitation:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Chat rooms.</li>
                <li>Bulletin boards.</li>
                <li>Competition entries.</li>
              </ul>
              <p>
                Where we do provide any interactive service, we will provide
                clear information to you about the kind of service offered, if
                it is moderated and what form of moderation is used (including
                whether it is human or technical).
              </p>
              <p>
                We will do our best to assess any possible risks for users (and
                in particular, for children) from third parties when they use
                any interactive service provided on our site, and we will decide
                in each case whether it is appropriate to use moderation of the
                relevant service (including what kind of moderation to use) in
                the light of those risks. However, we are under no obligation to
                oversee, monitor or moderate any interactive service we provide
                on our site, and we expressly exclude our liability for any loss
                or damage arising from the use of any interactive service by a
                user in contravention of our content standards, whether the
                service is moderated or not.
              </p>
              <p>
                The use of any of our interactive services by a minor is subject
                to the consent of their parent or guardian. We advise parents
                who permit their children to use an interactive service that it
                is important that they communicate with their children about
                their safety online, as moderation is not foolproof. Minors who
                are using any interactive service should be made aware of the
                potential risks to them.
              </p>
              <p>
                Where we do moderate an interactive service, we will normally
                provide you with a means of contacting the moderator, should a
                concern or difficulty arise.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4">
                4. Content standards
              </h2>
              <p>
                These content standards apply to any and all material which you
                contribute to our site (contributions), and to any interactive
                services associated with it.
              </p>
              <p>
                You must comply with the spirit of the following standards as
                well as the letter. The standards apply to each part of any
                contribution as well as to its whole.
              </p>
              <p>Contributions must:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Be accurate (where they state facts).</li>
                <li>Be genuinely held (where they state opinions).</li>
                <li>
                  Comply with applicable law in the UK and in any country from
                  which they are posted.
                </li>
              </ul>
              <p>Contributions must not:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Contain any material which is defamatory of any person.</li>
                <li>
                  Contain any material which is obscene, offensive, hateful or
                  inflammatory.
                </li>
                <li>Promote sexually explicit material.</li>
                <li>Promote violence.</li>
                <li>
                  Promote discrimination based on race, sex, religion,
                  nationality, disability, sexual orientation or age.
                </li>
                <li>
                  Infringe any copyright, database right or trade mark of any
                  other person.
                </li>
                <li>Be likely to deceive any person.</li>
                <li>
                  Be made in breach of any legal duty owed to a third party,
                  such as a contractual duty or a duty of confidence.
                </li>
                <li>Promote any illegal activity.</li>
                <li>
                  Be threatening, abuse or invade another&apos;s privacy, or
                  cause annoyance, inconvenience or needless anxiety.
                </li>
                <li>
                  Be likely to harass, upset, embarrass, alarm or annoy any
                  other person.
                </li>
                <li>
                  Be used to impersonate any person, or to misrepresent your
                  identity or affiliation with any person.
                </li>
                <li>
                  Give the impression that they emanate from us, if this is not
                  the case.
                </li>
                <li>
                  Advocate, promote or assist any unlawful act such as (by way
                  of example only) copyright infringement or computer misuse.
                </li>
              </ul>

              <h2 className="text-xl font-bold mt-8 mb-4">
                5. Suspension and termination
              </h2>
              <p>
                We will determine, in our discretion, whether there has been a
                breach of this acceptable use policy through your use of our
                site. When a breach of this policy has occurred, we may take
                such action as we deem appropriate.
              </p>
              <p>
                Failure to comply with this acceptable use policy constitutes a
                material breach of the terms of use upon which you are permitted
                to use our site, and may result in our taking all or any of the
                following actions:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  Immediate, temporary or permanent withdrawal of your right to
                  use our site.
                </li>
                <li>
                  Immediate, temporary or permanent removal of any posting or
                  material uploaded by you to our site.
                </li>
                <li>Issue of a warning to you.</li>
                <li>
                  Legal proceedings against you for reimbursement of all costs
                  on an indemnity basis (including, but not limited to,
                  reasonable administrative and legal costs) resulting from the
                  breach.
                </li>
                <li>Further legal action against you.</li>
                <li>
                  Disclosure of such information to law enforcement authorities
                  as we reasonably feel is necessary.
                </li>
              </ul>
              <p>
                We exclude liability for actions taken in response to breaches
                of this acceptable use policy. The responses described in this
                policy are not limited, and we may take any other action we
                reasonably deem appropriate.
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4">
                6. Changes to the acceptable use policy
              </h2>
              <p>
                We may revise this acceptable use policy at any time by amending
                this page. You are expected to check this page from time to time
                to take notice of any changes we make, as they are legally
                binding on you. Some of the provisions contained in this
                acceptable use policy may also be superseded by provisions or
                notices published elsewhere on our site.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
