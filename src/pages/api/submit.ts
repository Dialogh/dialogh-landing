import type { APIRoute } from "astro";

export const prerender = false;

interface SubmissionData {
  email_or_discord: string;
  timestamp: string;
  country?: string;
  region?: string;
  city?: string;
  ip?: string;
  userAgent: string;
  referer?: string;
  timezone?: string;
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

// Helper function to get location data from IP
async function getLocationFromIP(ip: string) {
  // Skip geolocation for localhost IPs
  if (
    ip === "Unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return {
      country: "Localhost/Private Network",
      region: "Development",
      city: "Local",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    };
  }

  // Try multiple geolocation services for better reliability
  const services = [
    async () => {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { "User-Agent": "Dialogh-Site/1.0" },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.reason || "API Error");
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
      };
    },
    async () => {
      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,timezone`
      );
      const data = await response.json();
      if (data.status !== "success")
        throw new Error(data.message || "API Error");
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone,
      };
    },
    async () => {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API Error");
      const [city, region] = (data.city || "Unknown,Unknown").split(",");
      return {
        country: data.country,
        region: region?.trim() || "Unknown",
        city: city?.trim() || "Unknown",
        timezone: data.timezone || "Unknown",
      };
    },
  ];

  for (let i = 0; i < services.length; i++) {
    try {
      console.log(`Trying geolocation service ${i + 1} for IP: ${ip}`);
      const result = await services[i]();

      // Validate the result
      if (result.country && result.country !== "Unknown") {
        return {
          country: result.country || "Unknown",
          region: result.region || "Unknown",
          city: result.city || "Unknown",
          timezone: result.timezone || "Unknown",
        };
      }
    } catch (error) {
      console.error(`Geolocation service ${i + 1} failed:`, error);
      continue;
    }
  }

  // All services failed
  console.error("All geolocation services failed for IP:", ip);
  return {
    country: "Unable to determine",
    region: "Unable to determine",
    city: "Unable to determine",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
  };
}

// Helper function to get client IP
function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const headers = request.headers;

  // Log headers for debugging
  console.log("Request headers for IP detection:", {
    "x-forwarded-for": headers.get("x-forwarded-for"),
    "x-real-ip": headers.get("x-real-ip"),
    "cf-connecting-ip": headers.get("cf-connecting-ip"),
    "x-client-ip": headers.get("x-client-ip"),
    "x-cluster-client-ip": headers.get("x-cluster-client-ip"),
    forwarded: headers.get("forwarded"),
  });

  // Try various headers in order of preference
  const ipSources = [
    headers.get("cf-connecting-ip"), // Cloudflare
    headers.get("x-real-ip"), // Nginx
    headers.get("x-client-ip"), // Apache
    headers.get("x-cluster-client-ip"), // Cluster
    headers.get("x-forwarded-for")?.split(",")[0]?.trim(), // Load balancers
  ];

  for (const ip of ipSources) {
    if (ip && ip !== "unknown" && isValidIP(ip)) {
      console.log("Detected IP:", ip);
      return ip;
    }
  }

  // Check Forwarded header (RFC 7239)
  const forwarded = headers.get("forwarded");
  if (forwarded) {
    const forMatch = forwarded.match(/for=([^;,\s]+)/);
    if (forMatch) {
      const ip = forMatch[1].replace(/"/g, "").replace(/\[|\]/g, "");
      if (isValidIP(ip)) {
        console.log("Detected IP from Forwarded header:", ip);
        return ip;
      }
    }
  }

  console.log("Unable to detect real IP, using fallback");
  return "Unknown";
}

// Helper function to validate IP address
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Helper function to determine if input is email or Discord ID
function identifyInputType(input: string): "email" | "discord" | "unknown" {
  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Discord ID patterns (user ID or username#discriminator or new username)
  const discordUserIdRegex = /^\d{17,19}$/; // Discord snowflake IDs
  const discordUsernameRegex = /^.{1,32}#\d{4}$|^[a-z0-9._]{2,32}$/; // Old format or new format

  if (emailRegex.test(input)) {
    return "email";
  } else if (
    discordUserIdRegex.test(input) ||
    discordUsernameRegex.test(input)
  ) {
    return "discord";
  }

  return "unknown";
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body
    const formData = await request.formData();
    const emailOrDiscord = formData.get("data") as string;

    if (!emailOrDiscord) {
      return new Response(
        JSON.stringify({ error: "Email or Discord ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get client information
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const referer = request.headers.get("referer") || "Direct";
    const clientIP = getClientIP(request);

    // Get location data
    const locationData = await getLocationFromIP(clientIP);

    // Prepare submission data
    const submissionData: SubmissionData = {
      email_or_discord: emailOrDiscord,
      timestamp: new Date().toISOString(),
      country: locationData.country,
      region: locationData.region,
      city: locationData.city,
      ip: clientIP,
      userAgent,
      referer,
      timezone: locationData.timezone,
    };

    // Identify input type
    const inputType = identifyInputType(emailOrDiscord);

    // Create Discord embed
    const embed: DiscordEmbed = {
      title: "🎯 New Dialogh Registration",
      description: `A new user has registered for Dialogh updates!\n\n**Input Type:** ${
        inputType === "email"
          ? "📧 Email Address"
          : inputType === "discord"
          ? "💬 Discord ID"
          : "❓ Unknown Format"
      }`,
      color:
        inputType === "email"
          ? 0x00ff88
          : inputType === "discord"
          ? 0x5865f2
          : 0xffa500, // Green for email, Discord blue for Discord, orange for unknown
      fields: [
        {
          name:
            inputType === "email"
              ? "📧 Email Address"
              : inputType === "discord"
              ? "💬 Discord Identifier"
              : "📝 User Input",
          value: `\`${emailOrDiscord}\``,
          inline: false,
        },
        {
          name: "🌍 Geographic Location",
          value: `**City:** ${locationData.city}\n**Region:** ${locationData.region}\n**Country:** ${locationData.country}`,
          inline: true,
        },
        {
          name: "🕒 Time Information",
          value: `**Timezone:** ${
            locationData.timezone
          }\n**Timestamp:** <t:${Math.floor(new Date().getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: "🌐 Technical Details",
          value: `**IP:** \`${clientIP}\`\n**Source:** ${
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
        type: inputType,
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
