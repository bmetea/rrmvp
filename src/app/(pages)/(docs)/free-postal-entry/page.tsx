import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import Link from "next/link";

export default function FreePostalEntryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Free Postal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p>To enter for free, send a stamped, unenclosed postcard to:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Claravue Ltd</p>
              <p>128 City Road, London,</p>
              <p>EC1 2NX</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">
              Include the following details (must match your account):
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>The name of the competition you wish to enter</li>
              <li>Your full name</li>
              <li>Your address</li>
              <li>Date of birth</li>
              <li>Contact telephone number and email address</li>
              <li>Your answer to the competition question (if required)</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p>
              Each valid postal entry receives 1 ticket and is treated in the
              same way as a paid entry.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Please note:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hand-delivered entries will not be accepted</li>
              <li>Bulk entries will count as one single entry</li>
              <li>Entries must arrive before the competition closes</li>
              <li>We do not confirm receipt of postal entries</li>
              <li>
                Your entry is subject to our{" "}
                <Link
                  href="/terms-and-conditions"
                  className="text-primary hover:underline"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
