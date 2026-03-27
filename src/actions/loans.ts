"use server";

import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function createLoan(copyCode: string, userEmail: string, days: number = 14) {
  const session = await auth();
  if (session?.user?.role !== "LIBRARIAN") {
    return { error: "Acesso negado." };
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return { error: "Usuário não encontrado com este e-mail." };

  const copy = await prisma.copy.findUnique({
    where: { code: copyCode },
    include: { book: true },
  });
  if (!copy) return { error: "Exemplar não encontrado com este código." };
  if (copy.status !== "AVAILABLE") {
    return { error: "Este exemplar não está disponível para empréstimo." };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);

  await prisma.$transaction([
    prisma.loan.create({
      data: {
        userId: user.id,
        copyId: copy.id,
        dueDate,
      },
    }),
    prisma.copy.update({
      where: { id: copy.id },
      data: { status: "BORROWED" },
    }),
  ]);

  revalidatePath("/admin/loans");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true, message: `Empréstimo de "${copy.book.title}" para ${user.name} realizado!` };
}

export async function returnLoan(loanId: string) {
  const session = await auth();
  if (session?.user?.role !== "LIBRARIAN") {
    return { error: "Acesso negado." };
  }

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { copy: { include: { book: true } } },
  });
  if (!loan) return { error: "Empréstimo não encontrado." };
  if (loan.status !== "ACTIVE") return { error: "Este empréstimo já foi devolvido." };

  // Check if there are pending reservations for this book
  const nextReservation = await prisma.reservation.findFirst({
    where: {
      bookId: loan.copy.bookId,
      status: "PENDING",
    },
    orderBy: { position: "asc" },
  });

  await prisma.$transaction(async (tx: TxClient) => {
    // Mark loan as returned
    await tx.loan.update({
      where: { id: loanId },
      data: { status: "RETURNED", returnDate: new Date() },
    });

    // Update copy status
    await tx.copy.update({
      where: { id: loan.copyId },
      data: { status: "AVAILABLE" },
    });

    // If someone is waiting, promote them
    if (nextReservation) {
      await tx.reservation.update({
        where: { id: nextReservation.id },
        data: { status: "AWAITING_PICKUP" },
      });
    }
  });

  revalidatePath("/admin/loans");
  revalidatePath("/admin");
  revalidatePath("/dashboard");

  const message = nextReservation
    ? `Devolvido! Reserva ativada para o próximo da fila.`
    : `Devolvido com sucesso!`;

  return { success: true, message };
}

export async function createReservation(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Você precisa estar logado." };

  const userId = session.user.id;

  // Check if user already has a reservation for this book
  const existing = await prisma.reservation.findUnique({
    where: { userId_bookId: { userId, bookId } },
  });
  if (existing && (existing.status === "PENDING" || existing.status === "AWAITING_PICKUP")) {
    return { error: "Você já possui uma reserva para este livro." };
  }

  // Get the next position in the queue
  const lastReservation = await prisma.reservation.findFirst({
    where: { bookId, status: "PENDING" },
    orderBy: { position: "desc" },
  });
  const position = (lastReservation?.position ?? 0) + 1;

  await prisma.reservation.create({
    data: { userId, bookId, position },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/reservations");
  return { success: true, message: `Reserva feita! Você é o ${position}º da fila.` };
}

export async function cancelReservation(reservationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Acesso negado." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) return { error: "Reserva não encontrada." };

  // Only the owner or a librarian can cancel
  if (reservation.userId !== session.user.id && session.user.role !== "LIBRARIAN") {
    return { error: "Acesso negado." };
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin/reservations");
  return { success: true };
}
