import type { APIRoute } from "astro";

export const prerender = false;

interface SubmissionData {
  email: string;
  timestamp: string;
  userAgent: string;
  referer?: string;
}

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp: string;
  footer?: {
    text: string;
  };
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body
    const formData = await request.formData();
    const email = formData.get("data") as string;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email address is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get client information
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const referer = request.headers.get("referer") || "Direct";

    // Prepare submission data
    const submissionData: SubmissionData = {
      email: email,
      timestamp: new Date().toISOString(),
      userAgent,
      referer,
    };

    // Create Discord embed
    const embed: DiscordEmbed = {
      title: "📧 New Email Registration",
      description: `A new user has registered for Dialogh updates!`,
      color: 0x00ff88, // Green for email
      fields: [
        {
          name: "📧 Email Address",
          value: `\`${email}\``,
          inline: false,
        },
        {
          name: "🕒 Registration Time",
          value: `<t:${Math.floor(new Date().getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: "🌐 Source",
          value: `${
            referer === "Direct" ? "🔗 Direct Access" : "🔗 " + referer
          }`,
          inline: true,
        },
        {
          name: "🖥️ User Agent",
          value: `\`\`\`${userAgent.substring(0, 200)}${
            userAgent.length > 200 ? "..." : ""
          }\`\`\``,
          inline: false,
        },
      ],
      timestamp: submissionData.timestamp,
      footer: {
        text: "Dialogh Registration System • dialogh.in",
      },
    };

    // Prepare webhook payload
    const webhookPayload: DiscordWebhookPayload = {
      embeds: [embed],
    };

    // Get webhook URL from environment variable
    const webhookUrl = import.meta.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("Discord webhook URL not configured");
      // Still return success to user, but log the error
      return new Response(
        JSON.stringify({
          success: true,
          message: "Registration recorded successfully!",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send to Discord webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      console.error(
        "Failed to send Discord webhook:",
        webhookResponse.statusText
      );
      // Still return success to user
    }

    // Log the submission (you can also save to a database here)
    console.log("New submission:", submissionData);

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Successfully registered! You'll be notified about Dialogh updates.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing submission:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Handle preflight OPTIONS request for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
