
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";


const BACKEND_URL = (
  process.env.BACKEND_URL ||
  "https://career-compass-backend-v8sv.onrender.com"
).replace(/\/+$/, "");


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              cache: "no-store",
            }
          );

          const contentType =
            response.headers.get("content-type") || "";

          const responseText = await response.text();

          if (!contentType.includes("application/json")) {
            console.error("Credentials login returned non-JSON:", {
              status: response.status,
              contentType,
              body: responseText.slice(0, 200),
            });

            return null;
          }

          let data: any;

          try {
            data = JSON.parse(responseText);
          } catch {
            console.error("Credentials login returned invalid JSON.");
            return null;
          }

          if (
            !response.ok ||
            !data.token ||
            !data.user?.id
          ) {
            console.error("Credentials backend login failed:", {
              status: response.status,
              message: data.message,
              hasUserId: Boolean(data.user?.id),
              hasBackendToken: Boolean(data.token),
            });

            return null;
          }

          return {
            id: String(data.user.id),
            name: data.user.name ?? null,
            email: data.user.email,
            backendToken: String(data.token),
          };
        } catch (error) {
          console.error("Credentials backend login error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Save the backend token returned by Credentials login.
      if (user) {
        const authenticatedUser = user as typeof user & {
          id?: string;
          backendToken?: string;
        };

        if (authenticatedUser.id) {
          token.userId = String(authenticatedUser.id);
        }

        if (authenticatedUser.backendToken) {
          token.backendToken = authenticatedUser.backendToken;
        }
      }

      // Exchange the Google ID token for your backend JWT.
      if (account?.provider === "google") {
        if (!account.id_token) {
          console.error("Google sign-in did not provide an ID token.");
          return token;
        }

        try {
          const response = await fetch(
            `${BACKEND_URL}/api/auth/google-login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                idToken: account.id_token,
              }),
              cache: "no-store",
            }
          );

          const contentType =
            response.headers.get("content-type") || "";

          const responseText = await response.text();

          if (!contentType.includes("application/json")) {
            console.error("Google login returned non-JSON:", {
              status: response.status,
              contentType,
              body: responseText.slice(0, 200),
            });

            return token;
          }

          let data: any;

          try {
            data = JSON.parse(responseText);
          } catch {
            console.error("Google login returned invalid JSON.");
            return token;
          }

          if (
            !response.ok ||
            !data.token ||
            !data.user?.id
          ) {
            console.error("Google backend login failed:", {
              status: response.status,
              message: data.message,
              hasUserId: Boolean(data.user?.id),
              hasBackendToken: Boolean(data.token),
            });

            return token;
          }

          token.userId = String(data.user.id);
          token.backendToken = String(data.token);

          console.log("Google backend login successful:", {
            hasUserId: Boolean(token.userId),
            hasBackendToken: Boolean(token.backendToken),
          });
        } catch (error) {
          console.error("Google backend authentication error:", error);
        }
      }

      // Never print the actual JWT.
      console.log("NEXTAUTH JWT RESULT:", {
        provider: account?.provider ?? "existing-session",
        hasUserId: Boolean(token.userId),
        hasBackendToken: Boolean(token.backendToken),
      });

      return token;
    },

async session({ session, token }) {
  // Expose the authenticated user's ID.
  if (session.user && token.userId) {
    session.user.id = String(token.userId);
  }

  // Expose the backend token in the session.
  if (token.backendToken) {
    session.backendToken = String(token.backendToken);

    // Also preserve it under session.user for compatibility.
    if (session.user) {
      (
        session.user as typeof session.user & {
          backendToken?: string;
        }
      ).backendToken = String(token.backendToken);
    }
  }

  return session;
},


  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

