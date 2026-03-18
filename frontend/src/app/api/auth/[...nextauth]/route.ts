// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  // src/app/api/auth/[...nextauth]/route.ts
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.id_token) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
          console.error("NEXT_PUBLIC_API_URL undefined");
          return false;
        }

        try {
          const res = await fetch(`${backendUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          });

          if (!res.ok) {
            console.error("Backend error:", await res.text());
            return false; // stop login if backend fails
          }
        } catch (err) {
          console.error("Backend call failed:", err);
          return false;
        }
      }
      return true;
    },
  },
});
export { handler as GET, handler as POST };
