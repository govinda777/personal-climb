export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchPersonalBySlug(slug: string) {
  const response = await fetch(`${API_URL}/api/personals/${slug}`, {
    next: { revalidate: 60 }, // Revalidate every minute
  });
  if (!response.ok) {
    throw new Error("Failed to fetch personal config");
  }
  return response.json();
}

export async function createCheckoutSession(
  packageId: string,
  personalId: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ packageId, personalId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }
  return response.json();
}

export async function fetchProfessorDashboard(token: string) {
  const response = await fetch(`${API_URL}/api/professor/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}
