import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";
import { ensureTable } from "@/lib/db";
import type { UserRole } from "@/types/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        await ensureTable();

        const { rows } = await sql`
          SELECT id, email, name, role, password_hash, is_active, section_permissions
          FROM users
          WHERE email = ${email}
        `;

        if (rows.length === 0) return null;

        const user = rows[0];
        if (!user.is_active) return null;

        const passwordMatch = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sectionPermissions: user.section_permissions ?? null,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/prihlaseni" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.sectionPermissions = user.sectionPermissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.sectionPermissions = token.sectionPermissions as string[] | null;
      return session;
    },
  },
});
