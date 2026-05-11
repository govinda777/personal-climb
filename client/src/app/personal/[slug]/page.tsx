'use client';

import { use } from 'react';
import Home from '@/app/page';

export default function PersonalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // No futuro, aqui buscaremos as configurações do personal pelo slug
  // Por enquanto, renderizamos a Home com o mock de sempre
  console.log(`Carregando perfil para: ${slug}`);

  return <Home />;
}
