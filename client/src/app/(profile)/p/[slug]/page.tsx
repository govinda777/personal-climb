import Home from '@/app/(marketing)/page';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateStaticParams() {
  return [
    { slug: 'govinda' }
  ];
}

export default async function PersonalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_URL}/personals/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error('Failed to fetch personal data');
    }
    const personalData = await res.json();
    return <Home personalData={personalData} />;
  } catch (error) {
    console.error(`Erro ao carregar perfil para: ${slug}`, error);
    // Fallback to mock if API is down
    return <Home />;
  }
}
