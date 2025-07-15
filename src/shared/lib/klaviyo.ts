// Klaviyo client-side tracking using their JavaScript snippet
// This approach avoids CORS issues by using their provided client-side SDK

declare global {
  interface Window {
    klaviyo?: any;
    _klOnsite?: any[];
  }
}

class KlaviyoAnalytics {
  private publicKey: string | null = null;
  private isEnabled = false;
  private isDebug = false;
  private isLoaded = false;

  constructor() {
    // Access environment variables at runtime for PPR compatibility
    if (typeof window !== "undefined") {
      this.publicKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY || "UtVSRv";
      this.isEnabled = true;
      this.isDebug = process.env.NODE_ENV === "development";

      // Log initialization status
      if (this.isDebug) {
        console.log("🔵 Klaviyo Analytics:", {
          enabled: this.isEnabled,
          hasPublicKey: !!this.publicKey,
          publicKeyPreview: this.publicKey
            ? `${this.publicKey.substring(0, 8)}...`
            : "none",
        });
      }

      // Load Klaviyo script if enabled
      if (this.isEnabled && this.publicKey) {
        this.loadKlaviyoScript();
      }
    }
  }

  private loadKlaviyoScript() {
    if (!this.publicKey || this.isLoaded) return;

    // Load Klaviyo.js script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://static.klaviyo.com/onsite/js/${this.publicKey}/klaviyo.js`;

    script.onload = () => {
      this.isLoaded = true;
      this.initializeKlaviyoObject();
      if (this.isDebug) {
        console.log("✅ Klaviyo script loaded successfully");
      }
    };

    script.onerror = () => {
      console.warn("❌ Failed to load Klaviyo script");
    };

    document.head.appendChild(script);
  }

  private initializeKlaviyoObject() {
    // Initialize the Klaviyo object if it doesn't exist
    if (!window.klaviyo) {
      window._klOnsite = window._klOnsite || [];
      try {
        window.klaviyo = new Proxy(
          {},
          {
            get: function (n, i) {
              return i === "push"
                ? function () {
                    var n;
                    (n = window._klOnsite).push.apply(n, arguments);
                  }
                : function () {
                    for (
                      var n = arguments.length, o = new Array(n), w = 0;
                      w < n;
                      w++
                    )
                      o[w] = arguments[w];
                    var t =
                      typeof o[o.length - 1] === "function" ? o.pop() : void 0;
                    var e = new Promise(function (n) {
                      const args = [
                        i,
                        ...o,
                        function (i: any) {
                          t && t(i);
                          n(i);
                        },
                      ];
                      window._klOnsite!.push(args);
                    });
                    return e;
                  };
            },
          }
        );
      } catch (n) {
        window.klaviyo = window.klaviyo || ({ push: function () {} } as any);
        window.klaviyo.push = function () {
          var n;
          (n = window._klOnsite).push.apply(n, arguments);
        };
      }
    }
  }

  private waitForKlaviyo(): Promise<void> {
    return new Promise((resolve) => {
      if (window.klaviyo && typeof window.klaviyo.track === "function") {
        resolve();
        return;
      }

      // Wait for klaviyo to be available
      const checkKlaviyo = () => {
        if (window.klaviyo && typeof window.klaviyo.track === "function") {
          resolve();
        } else {
          setTimeout(checkKlaviyo, 100);
        }
      };

      checkKlaviyo();
    });
  }

  async identify(
    userId: string,
    traits: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      [key: string]: any;
    }
  ) {
    if (!this.isEnabled || !this.publicKey) {
      if (this.isDebug) {
        console.log("⚠️ Klaviyo: Analytics disabled or no public key");
      }
      return;
    }

    try {
      await this.waitForKlaviyo();

      const identifyData = {
        $email: traits.email,
        $first_name: traits.firstName,
        $last_name: traits.lastName,
        $phone_number: traits.phone,
        external_id: userId,
        ...traits,
        last_updated: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(identifyData).forEach((key) => {
        if (identifyData[key] === undefined) {
          delete identifyData[key];
        }
      });

      window.klaviyo!.identify(identifyData);

      if (this.isDebug) {
        console.log("🔵 Klaviyo Identify:", {
          userId,
          email: traits.email,
          data: identifyData,
        });
      }
    } catch (error) {
      console.warn("🚨 Klaviyo identify failed:", error);
    }
  }

  async track(
    event: string,
    properties: {
      email?: string;
      userId?: string;
      [key: string]: any;
    } = {}
  ) {
    if (!this.isEnabled || !this.publicKey) {
      if (this.isDebug) {
        console.log("⚠️ Klaviyo: Analytics disabled or no public key");
      }
      return;
    }

    try {
      await this.waitForKlaviyo();

      const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] === undefined) {
          delete eventData[key];
        }
      });

      window.klaviyo!.track(event, eventData);

      if (this.isDebug) {
        console.log("🔵 Klaviyo Track:", {
          event,
          userId: properties.userId,
          email: properties.email,
          properties: eventData,
        });
      }
    } catch (error) {
      console.warn("🚨 Klaviyo track failed:", error);
    }
  }

  async page(
    pageName: string,
    properties: {
      email?: string;
      userId?: string;
      [key: string]: any;
    } = {}
  ) {
    return await this.track("Viewed Page", {
      page_name: pageName,
      ...properties,
    });
  }

  async trackViewedItem(properties: {
    Title: string;
    ItemId: string;
    Categories?: string[];
    ImageUrl?: string;
    Url?: string;
    Metadata?: Record<string, any>;
  }) {
    if (!this.isEnabled || !this.publicKey) {
      if (this.isDebug) {
        console.log("⚠️ Klaviyo: Analytics disabled or no public key");
      }
      return;
    }

    try {
      await this.waitForKlaviyo();

      window.klaviyo!.trackViewedItem(properties);

      if (this.isDebug) {
        console.log("🔵 Klaviyo Track Viewed Item:", properties);
      }
    } catch (error) {
      console.warn("🚨 Klaviyo trackViewedItem failed:", error);
    }
  }
}

// Create singleton instance
export const klaviyo = new KlaviyoAnalytics();

// Export analytics interface for unified tracking
export const analytics = {
  identify: (userId: string, traits: any) => klaviyo.identify(userId, traits),
  track: (event: string, properties: any) => klaviyo.track(event, properties),
  page: (page: string, properties: any) => klaviyo.page(page, properties),
};
