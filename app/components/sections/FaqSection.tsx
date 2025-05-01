import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqItems = [
  {
    question: "What is Radiance Rewards?",
    answer: "Radiance Rewards is a unique prize competition platform where you can enter for a chance to win high-value cosmetic procedures and luxury beauty products. Our draws offer you the opportunity to win treatments ranging from Botox and fillers to premium skincare surgeries, as well as exclusive beauty giveaways."
  },
  {
    question: "How Do The Competitions Work?",
    answer: `Winners of cosmetic procedures prizes receive a free consultation, and if eligible, the procedure is fully paid for by Radiance Rewards. If you are not eligible, you will receive a cash alternative which has varying rates.`
  },
  {
    question: "Types of Competitions",
    answer: `We run two types of competitions:
    1. Exclusive Prize Competitions (for high-value prizes such as cosmetic procedures) - These require entrants to answer a competition question before purchasing an entry.
    2. Automated Prize Draws (for beauty products and lower-cost prizes) - These do not require a skills question and are conducted as automated draws.`
  },
  {
    question: "Who Can Enter?",
    answer: `• You must be at least 18 years old to enter.
    • You must be a UK resident and eligible to enter prize contests.
    • Employees, agents, or representatives of Radiance Rewards or our partner organizations are not eligible to participate.`
  },
  {
    question: "How Are Winners Notified?",
    answer: `Email Notification: Winners will be contacted via the email address provided when entering the draw.
    Results Page: You can also view the winners' list on our Results Page.`
  },
  {
    question: "What Happens When I Win a Cosmetic Procedure?",
    answer: `Free Consultation: If you win, you'll receive a free consultation at one of our partnered cosmetic surgery clinics.
    
    Procedure Eligibility:
    • Eligible: Winners will fully cover the cost of your procedure.
    • Not Eligible: You'll be offered a cash alternative, provided within two working days.`
  },
  {
    question: "What If I Don't Want the Procedure?",
    answer: `Cash Alternative Option:
    • If you are unable or choose not to undergo the procedure, you will be offered a cash alternative.
    • The cash alternative amount will be clearly specified in the prize details on the competition page.`
  },
  {
    question: "How Do I Purchase an Entry?",
    answer: `Simple Purchase Process:
    • Visit our competition page
    • Select the prize draw you want to enter
    • Add entries to your basket to purchase your entry
    
    Secure Payments:
    • Our checkout accepts all UK secure payment options include Apple Pay, Google Pay, Visa, Mastercard, American Express.`
  },
  {
    question: "Do I Have to Answer a Skills Question for Every Competition?",
    answer: `No:
    • Cosmetic Procedure Competitions (high-value prizes) require a skill-based question to ensure compliance with UK regulations.
    • Instant Win & Beauty Product Giveaways (low-cost prizes) do not require a skills question and function as random draws.
    
    All competitions include a free postal entry option, which is detailed on the Free Entry Page.`
  },
  {
    question: "What Are My Chances of Winning?",
    answer: `Fair & Transparent Draws:
    • Every entry you purchase gives you an equal chance of winning.
    • The odds are depending on the number of entries sold for a specific draw.
    • The list of taken numbers is published on our Results Page.`
  },
  {
    question: "Can I Enter Multiple Times?",
    answer: `Yes! You can purchase multiple entries to increase your chances of winning.
    Some competitions may have a maximum entry limit per person, which will be clearly displayed on the competition page.`
  },
  {
    question: "Is There a Free Entry Route?",
    answer: `Yes! We offer a genuine 'no entry method' for all competitions:
    • Free postal entries are accepted for all draws
    • Full details are available on our Free Entry Page
    • Free entries are treated equally to paid entries in the draws`
  },
  {
    question: "How Can I Contact Support?",
    answer: `Email: Our support team aims to respond within 24 hours.
    Our support team is happy to help with any inquiries or issues.`
  },
  {
    question: "Are My Personal Details Secure?",
    answer: `Yes, your privacy is important to us:
    • All data is processed in accordance with our Privacy Policy
    • We use industry-standard encryption and security measures to protect your information`
  },
  {
    question: "What Should I Do If I Have a Complaint?",
    answer: `If you have any issues, please contact us via:
    • Email: support@radiancerewards.co.uk
    We are committed to resolving any concerns quickly and fairly.`
  },
  {
    question: "How Do Automated Draws Work?",
    answer: `Random & Fair Selection:
    • Our automated draw system uses a transparent randomization algorithm based on the timestamp
    • The draw takes place immediately after the competition closes
    • Winners are automatically notified and published on our Results Page
    
    For more details on our draw process, visit our How It Works page.`
  },
  {
    question: "When is the Draw for My Competition?",
    answer: `Each competition has a set closing date, displayed on the competition page:
    • The draw for each competition takes place shortly after the closing time
    • Winners are announced on the Results Page and notified by email`
  }
]

export default function FaqSection() {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Accordion type="multiple" className="w-full space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border rounded-lg px-4 bg-white"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4 whitespace-pre-line">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
} 