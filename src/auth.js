import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.modify",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account && user.id) {
                console.log(`[Auth] User ${user.id} signed in with ${account.provider}. Updating tokens...`);
                // Update the account tokens in the database manually
                await prisma.account.update({
                    where: {
                        provider_providerAccountId: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                        },
                    },
                    data: {
                        access_token: account.access_token,
                        refresh_token: account.refresh_token,
                        expires_at: account.expires_at,
                        scope: account.scope,
                        id_token: account.id_token,
                    },
                });
                console.log(`[Auth] Tokens updated successfully for user ${user.id}`);
            }
            return true;
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});
