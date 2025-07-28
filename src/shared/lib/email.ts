import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

/**
 * Email utility for sending emails via AWS SES
 *
 * Multi-environment setup:
 * - Production (prd): Creates SES identity "rr-email-prd", sends from noreply@radiancerewards.co.uk
 * - Pre-production (ppr): Creates SES identity "rr-email-ppr", sends from noreply-ppr@radiancerewards.co.uk
 * - Development (bmetea): References ppr identity "rr-email-ppr", sends from dev@radiancerewards.co.uk
 *
 * Domain verification only needs to be done once in production for radiancerewards.co.uk
 * Each environment gets its own configuration set for better isolation (except dev)
 */

const client = new SESv2Client();

/**
 * Get the email configuration set name from SST Resource
 * Uses the single rr-email-ppr identity for all stages
 */
function getEmailConfigSet(): string | undefined {
  try {
    console.log("🔍 Checking SST Email resource:", {
      resourceExists: !!Resource["rr-email-ppr"],
      hasConfigSet:
        Resource["rr-email-ppr"] && "configSet" in Resource["rr-email-ppr"],
      availableResources: Object.keys(Resource || {}),
    });

    // All stages use the same rr-email-ppr identity
    if (Resource["rr-email-ppr"] && "configSet" in Resource["rr-email-ppr"]) {
      const configSet = Resource["rr-email-ppr"].configSet;
      console.log("✅ Found email config set:", configSet);
      return configSet;
    }

    console.warn("⚠️ No email config set found");
    return undefined;
  } catch (error) {
    console.warn("❌ Failed to get email config set:", error);
    return undefined;
  }
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
  from,
}: SendEmailOptions) {
  const fromAddress =
    from || process.env.EMAIL_FROM_ADDRESS || "noreply@radiancerewards.co.uk";
  const toAddresses = Array.isArray(to) ? to : [to];

  // Log email attempt details
  console.log("📧 Starting email send:", {
    from: fromAddress,
    to: toAddresses,
    subject: subject,
    hasHtmlBody: !!htmlBody,
    hasTextBody: !!textBody,
    configSet: getEmailConfigSet(),
    timestamp: new Date().toISOString(),
  });

  const content: any = {
    Simple: {
      Subject: { Data: subject },
    },
  };

  if (htmlBody && textBody) {
    content.Simple.Body = {
      Html: { Data: htmlBody },
      Text: { Data: textBody },
    };
  } else if (htmlBody) {
    content.Simple.Body = {
      Html: { Data: htmlBody },
    };
  } else if (textBody) {
    content.Simple.Body = {
      Text: { Data: textBody },
    };
  } else {
    throw new Error("Either htmlBody or textBody must be provided");
  }

  try {
    const configSetName = getEmailConfigSet();

    console.log("📤 Sending email via AWS SES:", {
      fromAddress,
      toCount: toAddresses.length,
      configSet: configSetName || "(none)",
      region: process.env.AWS_REGION || "eu-west-1",
    });

    const result = await client.send(
      new SendEmailCommand({
        FromEmailAddress: fromAddress,
        Destination: {
          ToAddresses: toAddresses,
        },
        Content: content,
        ConfigurationSetName: configSetName,
      })
    );

    console.log("✅ Email sent successfully:", {
      messageId: result.MessageId,
      to: toAddresses,
      subject: subject.substring(0, 50) + (subject.length > 50 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });

    // Log the full AWS SES result for debugging
    console.log("🔍 Full AWS SES response:", {
      fullResult: result,
      metadata: result.$metadata,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to send email:", {
      error: error instanceof Error ? error.message : String(error),
      to: toAddresses,
      from: fromAddress,
      subject: subject,
      configSet: getEmailConfigSet(),
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
