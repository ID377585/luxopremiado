const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBrlFromCents(valueInCents: number): string {
  return brlFormatter.format(valueInCents / 100);
}

export function formatRaffleNumber(value: number): string {
  return String(value).padStart(12, "0");
}
