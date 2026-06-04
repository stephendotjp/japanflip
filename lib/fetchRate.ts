export async function fetchJPYRate(): Promise<number> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=JPY", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 154.2;
    const data = await res.json();
    return data.rates.JPY as number;
  } catch {
    return 154.2;
  }
}
