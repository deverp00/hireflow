"use strict";

const REQUIRED_CONFIG = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_DATABASE_URL",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_APP_ID"
];

function jsonResponse(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            ...extraHeaders
        }
    });
}

function securityHeaders(headers) {
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "DENY");
    headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    return headers;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
         * API routes
         */

        if (url.pathname.startsWith("/api/")) {
            if (url.pathname !== "/api/firebase-config") {
                return jsonResponse(
                    { error: "API endpoint not found." },
                    404
                );
            }

            if (request.method !== "GET") {
                return jsonResponse(
                    { error: "Method not allowed." },
                    405,
                    { Allow: "GET" }
                );
            }

            const missing = REQUIRED_CONFIG.filter(
                (key) => !env[key]
            );

            if (missing.length > 0) {
                return jsonResponse(
                    {
                        error: "Firebase configuration is incomplete."
                    },
                    503
                );
            }

            /*
             * These are public Firebase web-app configuration
             * values, not service-account credentials.
             *
             * Configure them in Cloudflare Worker variables.
             * Never add private credentials to this response.
             */

            const firebaseConfig = {
                apiKey: env.FIREBASE_API_KEY,
                authDomain: env.FIREBASE_AUTH_DOMAIN,
                databaseURL: env.FIREBASE_DATABASE_URL,
                projectId: env.FIREBASE_PROJECT_ID,
                appId: env.FIREBASE_APP_ID
            };

            if (env.FIREBASE_STORAGE_BUCKET) {
                firebaseConfig.storageBucket =
                    env.FIREBASE_STORAGE_BUCKET;
            }

            if (env.FIREBASE_MESSAGING_SENDER_ID) {
                firebaseConfig.messagingSenderId =
                    env.FIREBASE_MESSAGING_SENDER_ID;
            }

            return jsonResponse(firebaseConfig);
        }

        /*
         * Serve the static website through Cloudflare Assets.
         * The ASSETS binding will be configured in wrangler.toml.
         */

        if (!env.ASSETS) {
            return new Response(
                "Static asset binding is not configured.",
                {
                    status: 503,
                    headers: {
                        "Content-Type": "text/plain; charset=utf-8",
                        "X-Content-Type-Options": "nosniff"
                    }
                }
            );
        }

        const response = await env.ASSETS.fetch(request);
        const headers = securityHeaders(
            new Headers(response.headers)
        );

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    }
};
