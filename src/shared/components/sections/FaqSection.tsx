import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

const faqItems = [
  {
    question: "What is Radiance Rewards?",
    answer:
      "Radiance Rewards is a unique prize competition platform offering you the chance to win high-value cash prizes intended for cosmetic procedures and luxury beauty products. Our competitions include everything from exclusive beauty bundles to prizes designed to fund treatments such as Anti-Wrinkle Treatments, Dermal Fillers, and premium cosmetic surgeries.",
  },
  {
    question: "How do I enter the competition?",
    answer: `First, create an account on our website. Then, select the competition you wish to enter.\n\nFollow the instructions to submit your entry—either by purchasing tickets or using our free postal entry route.\n\nIf you’re entering a skill-based competition, you'll need to answer a qualifying question. Once submitted, you'll be told whether you’ve answered correctly. If so, you’ll be entered into the prize draw.\n\nYou will get a confirmation on screen to paying entrants confirming whether their answer was right or wrong, and confirming entry into the draw.\n\nFor Instant Wins & Low-Cost Beauty Giveaways, no question is required. These are run as randomised draws.`,
  },
  {
    question: "Where can I see my ticket numbers?",
    answer: `Once you’re logged in, tap on (mobile) or hover over (desktop) your account in the top right corner and select ‘My Entries’ from the dropdown. Here you will see all your ticket numbers for the competitions you have entered, good luck!`,
  },
  {
    question: "Draw Selection",
    answer: `- Automated Draws: Performed using a secure, verified randomisation algorithm to ensure fairness.\n- Live Draws: Some draws may be streamed on our social media channels.\n\nOur checkout process is fully secure. We accept Apple Pay, Google Pay, Visa, Mastercard, American Express, and more.`,
  },
  {
    question: "How will I know if I’ve won?",
    answer: `Winners are contacted via phone or email within 14 days of a competition closing. If your contact details change, you must let us know. If we cannot contact you within 14 days, we may select another winner and you will forfeit the prize.`,
  },
  {
    question: "What Happens When I Win a Cosmetic Procedure Prize?",
    answer: `It’s a Cash Prize—You Choose What to Do With It\n\nWinners of our cosmetic procedure competitions receive a cash prize intended to fund any treatment or surgery of their choice, including consultation, treatment, travel, aftercare, or accommodation.\n\n- Choose Your Own Clinic: You can book with any licensed provider in the UK or abroad—it's entirely your decision.\n- No Medical Eligibility Check by Us: Because this is a cash prize, we do not assess your eligibility. You're responsible for ensuring you're a suitable candidate with your chosen provider.\n- Spend It However You Want: You're under no obligation to use the cash for treatment. If you change your mind, the prize is yours to keep and use however you like.\n\nThis model empowers our winners with complete freedom and flexibility.`,
  },
  {
    question: "What if I don’t want the procedure?",
    answer: `No problem. As this is a cash prize, you can use it however you wish. You are not required to undergo treatment or provide proof of usage.\n\nDetails of the prize value and structure are always clearly outlined on each competition page.`,
  },
  {
    question: "How do Automated Draws work?",
    answer: `Our Automated Draws use a secure, independently verified randomisation algorithm (based on the Mersenne Twister) to fairly select winners.\n\nDraws occur immediately after each competition closes. Winners are notified directly, and results are published on our Results Page.\n\nFor full details, visit our How It Works page.`,
  },
  {
    question: "How long is the competition open for?",
    answer: `Each competition’s open and close dates are clearly stated on the website. If these need to change for reasons outside our control, we’ll update the website accordingly.`,
  },
  {
    question: "Can anyone enter the competition?",
    answer: `Entrants must be UK residents aged 18 or over.\n\nWe cannot accept entries from outside the UK due to legal and compliance restrictions.\n\nAlso, employees or direct relatives of our suppliers are not eligible to enter.`,
  },
  {
    question: "What are the prizes?",
    answer: `Prizes vary by competition and are clearly detailed on each competition page. If a prize becomes unavailable, we reserve the right to offer an equal or higher value alternative.\n\nFor more information, visit www.radiancerewards.co.uk.`,
  },
  {
    question: "Can I sell the prize if I don’t want it?",
    answer: `Yes. If you win, the prize is yours to keep, use, or sell—entirely at your discretion.`,
  },
  {
    question: "How do you use my personal data?",
    answer: `We only use your data to administer the competition and distribute prizes. We never sell or share your data with third parties unless legally necessary.\n\nFull details are in our Privacy Policy at www.radiancerewards.co.uk/privacypolicy.\n\nWe may be required to share winner details with the Advertising Standards Authority to verify that competitions are run fairly.`,
  },
  {
    question: "If I win, do I have to participate in promotional activity?",
    answer: `No. Participation in promotional content is completely optional.\n\nHowever, if you’re happy to be featured, we’d love to celebrate your win on our social media channels and website.`,
  },
  {
    question: "What happens if I get the question wrong?",
    answer: `If your answer is incorrect, you will not be entered into the draw, and your entry fee is non-refundable. You can try again if you wish.\n\nThe skill question is a legal requirement to ensure this is a competition and not a lottery.\n\nSee more in our Terms & Conditions at www.radiancerewards.co.uk/termsandconditions.`,
  },
  {
    question: "Can I enter more than once?",
    answer: `Yes, you can enter multiple times up to the competition’s entry limit.\n\nWhile this isn’t gambling, we recommend playing responsibly and not spending more than you can afford.`,
  },
  {
    question: "How is the winner decided?",
    answer: `All correct entries are entered into a draw, and the winner is selected at random.`,
  },
  {
    question: "What are my chances of winning?",
    answer: `Each competition has a clearly defined maximum number of entries. For example, in a draw capped at 3,000 entries, if you submit one correct entry, your odds are no worse than 1 in 3,000.\n\nYour chances improve with more correct entries and if others answer incorrectly.`,
  },
  {
    question: "Why is the question so hard?",
    answer: `To legally qualify as a prize competition under UK law, there must be a level of skill involved.\n\nThe question is intentionally challenging to comply with legal standards and to give better odds to those who answer correctly.`,
  },
  {
    question: "I haven’t received my confirmation email.",
    answer: `Please check your spam/junk folder. If it’s not there, email us at contactus@radiancerewards.co.uk and we’ll be happy to help.`,
  },
  {
    question: "Can I get a refund of my entry fee?",
    answer: `No refunds are given if you answer incorrectly or are disqualified.`,
  },
  {
    question: "My question hasn’t been answered here",
    answer: `We’re here to help! Email us at contactus@radiancerewards.co.uk and a member of our team will get back to you.`,
  },
];

export function FaqSection() {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-[42px] md:text-[52px] lg:text-[63px] font-medium leading-[1.2em] font-sans text-center mb-2">
              Frequently Asked Questions
            </CardTitle>
            <p className="text-muted-foreground text-center text-[16px] md:text-[17px] lg:text-[18px] font-normal leading-[1.5em] font-open-sans">
              Find answers to common questions about our competitions and prizes
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="whitespace-pre-line text-muted-foreground">
                      {item.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
