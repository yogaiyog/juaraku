/**
 * Seed admin user for next-auth
 *
 * Usage: npx tsx scripts/seed-admin.ts
 */
import { hash } from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "yoga@local";
  const password = "yoga123";
  const hashedPassword = await hash(password, 12);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Admin user "${email}" already exists. Updating password...`);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log("Password updated.");
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Admin",
      },
    });
    console.log(`Admin user "${email}" created.`);
  }

  console.log(`\nLogin credentials:`);
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
