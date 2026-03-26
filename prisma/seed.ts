import { prisma } from "../src/lib/prisma";
import bcryptjs from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcryptjs.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@biblio.com" },
    update: {},
    create: {
      name: "Bibliotecário Admin",
      email: "admin@biblio.com",
      password: adminPassword,
      role: "LIBRARIAN",
    },
  });
  console.log("  ✅ Admin:", admin.email);

  // Create reader user
  const readerPassword = await bcryptjs.hash("leitor123", 10);
  const reader = await prisma.user.upsert({
    where: { email: "leitor@biblio.com" },
    update: {},
    create: {
      name: "Maria Leitora",
      email: "leitor@biblio.com",
      password: readerPassword,
      role: "READER",
    },
  });
  console.log("  ✅ Reader:", reader.email);

  // Create books
  const booksData = [
    {
      title: "Dom Casmurro",
      author: "Machado de Assis",
      isbn: "978-85-359-0277-1",
      genre: "Romance",
      publishedYear: 1899,
      synopsis: "Um dos romances mais emblemáticos da literatura brasileira, narra a história de Bentinho e Capitu.",
    },
    {
      title: "Grande Sertão: Veredas",
      author: "Guimarães Rosa",
      isbn: "978-85-209-2678-5",
      genre: "Romance",
      publishedYear: 1956,
      synopsis: "Riobaldo, ex-jagunço, narra suas aventuras e sua paixão por Diadorim nos sertões de Minas Gerais.",
    },
    {
      title: "O Cortiço",
      author: "Aluísio Azevedo",
      isbn: "978-85-7232-083-2",
      genre: "Naturalismo",
      publishedYear: 1890,
      synopsis: "Retrato da vida em um cortiço no Rio de Janeiro do século XIX.",
    },
    {
      title: "Memórias Póstumas de Brás Cubas",
      author: "Machado de Assis",
      isbn: "978-85-325-1469-5",
      genre: "Romance",
      publishedYear: 1881,
      synopsis: "Um defunto autor narra suas memórias com humor e ironia.",
    },
    {
      title: "Vidas Secas",
      author: "Graciliano Ramos",
      isbn: "978-85-01-07098-4",
      genre: "Regionalismo",
      publishedYear: 1938,
      synopsis: "A saga da família de Fabiano pelo sertão nordestino.",
    },
    {
      title: "Capitães da Areia",
      author: "Jorge Amado",
      isbn: "978-85-359-0313-6",
      genre: "Romance Social",
      publishedYear: 1937,
      synopsis: "O cotidiano de um grupo de meninos de rua em Salvador.",
    },
  ];

  for (const bookData of booksData) {
    const book = await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: {},
      create: bookData,
    });

    // Create copies for each book
    const copyCount = Math.floor(Math.random() * 3) + 2; // 2-4 copies
    for (let i = 1; i <= copyCount; i++) {
      const code = `${book.isbn.slice(-4)}-${String(i).padStart(2, "0")}`;
      await prisma.copy.upsert({
        where: { code },
        update: {},
        create: {
          code,
          bookId: book.id,
          condition: i === 1 ? "NEW" : "GOOD",
        },
      });
    }
    console.log(`  ✅ Book: ${book.title} (${copyCount} copies)`);
  }

  // Create a sample active loan
  const firstBook = await prisma.book.findFirst({
    include: { copies: true },
  });
  if (firstBook && firstBook.copies.length > 0) {
    const copy = firstBook.copies[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);

    await prisma.loan.upsert({
      where: { id: "seed-loan-1" },
      update: {},
      create: {
        id: "seed-loan-1",
        userId: reader.id,
        copyId: copy.id,
        dueDate,
      },
    });

    await prisma.copy.update({
      where: { id: copy.id },
      data: { status: "BORROWED" },
    });

    console.log(`  ✅ Sample loan created for ${reader.name}`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin: admin@biblio.com / admin123");
  console.log("   Reader: leitor@biblio.com / leitor123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
