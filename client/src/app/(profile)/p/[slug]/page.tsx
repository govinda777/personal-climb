import Home from '@/app/(marketing)/page';

export function generateStaticParams() {
  return [
    { slug: 'default' },
    { slug: 'govinda' }
  ];
}

export default async function PersonalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // No futuro, aqui buscaremos as configurações do personal pelo slug
  // Por enquanto, renderizamos a Home com o mock de sempre
  console.log(`Carregando perfil para: ${slug}`);

  return <Home />;
}
