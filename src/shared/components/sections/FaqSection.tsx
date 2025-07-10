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
      "Radiance Rewards is a unique prize competition platform where you can enter for a chance to win high-value cosmetic procedure prizes and luxury beauty products. Our draws offer you the opportunity to win treatments ranging from Botox and Fillers to premium cosmetic surgeries, as well as exclusive beauty giveaways.\n\nWinners of cosmetic procedure prizes receive a free consultation, and if eligible, the procedure is fully paid for by Radiance Rewards. If you are not eligible, you will receive a cash alternative within two working days.",
  },
  {
    question: "How do I enter the competition?",
    answer:
      "First, ensure you have opened and account on our website. Then choose the competition you wish to enter.\n\nComplete and submit the online entry form or follow the instructions on how to enter for free.\n\nWhen you have paid your entry fee, you will be told if you have answered the question correctly. If you have, your name will be entered in the draw with all of the other correct entries. If you have not answered correctly, you will not be entered into the draw.\n\nYou will also receive an email confirming whether your answer is right or wrong and confirming if you have been entered into the draw.\n\nAnyone entering for free will not be told whether they have answered the question correctly and will not receive confirmation that they are entered into the draw.\n\nHowever, an entry list is published and therefore all entrants should check this to ensure they have been entered into the draw for the competition they have entered.\n\nInstant Wins & Low-Cost Giveaways (for beauty products and lower-value prizes) – These do not require a skills question and are conducted as randomised draws.\n\nDraw Selection:\n* Automated Draws: Conducted using a secure randomisation algorithm to ensure fairness.\n* Live Draws: Some competitions may be streamed live on our social media channels.\n\nOur checkout process is fully secure.\n\nPayment options include Apple Pay, Google Pay, Visa, Mastercard, American Express, and more.",
  },
  {
    question: "How will I know if I have won?",
    answer:
      "We will notify the winner via telephone or email within 14 days of the closing date of the competition. If you change any of your contact details prior to the closing date, you must inform us. We will try to contact you using the information you have supplied us with. If we cannot reach you within 14 days of the closing date we reserve the right to choose another winner and you will lose your right to claim the prize.",
  },
  {
    question: "What Happens When I Win a Cosmetic Procedure?",
    answer:
      "Cash Prize to Use as You Choose:\nIf you win, you'll receive a cash prize intended to fund your cosmetic procedure, including consultation, treatment, aftercare, travel, and accommodation if needed.\n\nYou Choose the Clinic:\nYou have complete freedom to select any licensed provider (UK or international). Radiance Rewards does not restrict your choice or make bookings on your behalf.\n\nNo Eligibility Assessment by Us:\nBecause the prize is paid directly to you, you are responsible for arranging your consultation and ensuring you're medically eligible with your chosen provider.\n\nUse the Funds However You Wish:\nIf you decide not to proceed with treatment, the funds are yours to keep and can be used however you choose.",
  },
  {
    question: "What If I Don't Want the Procedure?",
    answer:
      "Cash Alternative Option:\n* If you are not eligible or choose not to undergo the procedure, you will be offered a cash alternative.\n* The cash alternative amount will be clearly outlined in the prize details on the competition page.",
  },
  {
    question: "How Do Automated Draws Work?",
    answer:
      "Random & Fair Selection:\nOur Automated Draws use a secure, independently verified randomisation algorithm (based on the Mersenne Twister algorithm) to select a winner.\n\nThe draw takes place immediately after the competition closes.\n\nThe winner is notified directly, and results are published on our Results Page.\n\nFor more details on our draw process, visit our How It Works page.",
  },
  {
    question: "How long is the competition open for?",
    answer:
      "The opening and closing date of the competitions are stated on the website. If we have to change either of these dates for any reason, we will update the website accordingly. We will only change the dates if we have to for reasons outside of our control.",
  },
  {
    question: "Can anyone enter the competition?",
    answer:
      "The competition is open to residents of the United Kingdom only who are 18 years or older.\n\nWe do not except entries from anyone outside of these areas as the laws for running competitions vary. This competition has been organised to comply with the laws of England, and Wales.\n\nAlso, you cannot enter this competition if you are a relative of any of our suppliers.",
  },
  {
    question: "What are the prizes?",
    answer:
      "The prizes are described fully on the website. You can find out more details by clicking here www.radiancerewards.co.uk\n\nWe reserve the right to offer an alternative prize of an equal or higher value if the prize is unavailable for any reason.",
  },
  {
    question: "Can I sell the prize if I don't want it?",
    answer:
      "If you are the winner, the prize will be yours. You can do what ever you wish with it, including selling it.",
  },
  {
    question: "How do you use my personal data?",
    answer:
      "We need to use your data to administer the competition and award prizes. We do not use your data for any other purpose.\n\nWe do not share your data with any third parties unless this is necessary for administering the competition.\n\nFull details of how we use your data are included in our Privacy Policy which you can read here www.radiancerewards/privacypolicy.co.uk\n\nIf you are the winner, we may have to share your details with the Advertising Standards Authority to confirm that we have administered the competition and awarded the prizes fairly.\n\nYou have the right to opt out from us using your data at any time. However, if you do ask us to remove your details from our database prior to the closing date, you will be withdrawing from the competition. You will not be entitled to a refund of any entry fees you have paid.",
  },
  {
    question: "If I win, do I have to participate in promotional exercises?",
    answer:
      "No, this is not compulsory. However, with your permission, we would love to share your excitement on our website and social media pages.\n\nEven if you do not want to participate in any promotional exercises, we may have may have to provide your details to the Advertising Standards Authority to prove we have administered the competition and awarded the prize fairly.",
  },
  {
    question: "What happens if I get the question wrong?",
    answer:
      "Whilst this may be disappointing, you have to remember that this is a competition and we have deliberately made the question tough to comply with the law. See more on this below www.radiancerewards/termsandconditions.co.uk\n\nIf you get the question wrong, you will not be entered into the draw so you will not have the chance to win the prize. You will not be entitled to a refund of your entry fees. If you want to, you can try again.",
  },
  {
    question: "Can I try again?",
    answer:
      "You can enter the competition as many times as you wish up to any limit we specify. Your entries may be restricted if we reach the maximum number of entries.\n\nWhilst this isn't gambling, we still urge you to keep this fun and not spend more than you can afford.",
  },
  {
    question: "How is the winner decided?",
    answer:
      "Everyone who gets the answer to the question correct will be entered into a draw. The winner will then be chosen at random from all the correct entries.",
  },
  {
    question: "What are my chances of winning?",
    answer:
      'The maximum number of entries is stated on each competition so your chances of winning will vary from competition to competition. As an example, if entries are capped at a maximum of 3000, this means that if you purchase 1 entry and get the answer correct, your chances of winning will be no worse than 1 in 3,000.\n\nYou can increase your chances of winning by purchasing more entries. For example, if you purchase 10 entries in the example above and you get the answer correct, your chances of winning will be no worse than 1 in 300.\n\nWe say "no worse than" because we expect a significant number of people to get the answer to the question wrong. We cannot predict how many this will be but say 500 people got the answer wrong and they each purchased 1 entry each. Your chances of winning with a single correct entry will now improve to 1 in 2,500.',
  },
  {
    question: "Why is the question so hard?",
    answer:
      "This is not a lottery or a free prize draw. It is a prize competition and the law says that to be in with a chance of winning, you must demonstrate your skill, knowledge or judgement.\n\nThe law says that the question should be sufficiently difficult that a significant number of people either get the answer wrong or are put off entering. However, this means that the odds of winning are actually increased for those who get the answer correct.",
  },
  {
    question:
      "I haven't received an email confirming whether I am right or wrong.",
    answer:
      "If you haven't received an email from us confirming your entry and whether you got the question right or wrong, please check your spam folder. If it is not in there, please email us at hello@radiancerewards.co.uk",
  },
  {
    question: "Can I get a refund of my entry fee?",
    answer:
      "We do not offer refunds of entry fees if you get the answer to the question wrong, or if you are disqualified from the competition for any reason.",
  },
  {
    question: "My question hasn't been answered here",
    answer:
      "If you have any questions that have not been answered here, please email us at hello@radiancerewards.co.uk and we will happily answer them for you.",
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
