import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUserFromGoogle } from "@/lib/queries/users";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const ALLOWED_GOOGLE_DOMAIN = "xiyuebiomed.com.tw";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // `hd` only hints Google's account chooser to prefer this domain --
      // it is NOT enforcement. The real check happens in the signIn
      // callback below, since a user can still pick a different account.
      authorization: {
        params: { hd: ALLOWED_GOOGLE_DOMAIN, prompt: "select_account" },
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email || !profile.email_verified) return false;
      const hd = (profile as { hd?: string }).hd;
      const domain = profile.email.split("@")[1]?.toLowerCase();
      if (hd !== ALLOWED_GOOGLE_DOMAIN && domain !== ALLOWED_GOOGLE_DOMAIN) {
        return false;
      }
      return true;
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await upsertUserFromGoogle({
          orgId: CURRENT_ORG_ID,
          email: profile.email,
          name: (profile.name as string | undefined) ?? profile.email,
        });
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = String(token.userId);
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});
