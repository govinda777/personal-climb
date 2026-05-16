'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/Button';

const profileSchema = z.object({
  brandName: z.string().min(2, 'O nome da marca deve ter pelo menos 2 caracteres.'),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida. Use o formato HEX (ex: #FF0000).'),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PerfilConfigPage() {
  const { getAccessToken } = usePrivy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      brandName: '',
      primaryColor: '#000000',
      bio: '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = await getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/professor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar perfil');
      }

      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro inesperado.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-zinc-200 mt-8">
      <h1 className="text-2xl font-bold mb-6">Configuração de Marca e Perfil</h1>

      {successMessage && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded">{successMessage}</div>}
      {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{errorMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome da Marca</label>
          <input
            {...register('brandName')}
            className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none"
            placeholder="Minha Assessoria"
          />
          {errors.brandName && <p className="text-red-500 text-sm mt-1">{errors.brandName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Cor Primária (Hex)</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              {...register('primaryColor')}
              className="h-10 w-10 p-1 border border-zinc-300 rounded cursor-pointer"
            />
            <input
              {...register('primaryColor')}
              className="flex-1 p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none font-mono"
              placeholder="#000000"
            />
          </div>
          {errors.primaryColor && <p className="text-red-500 text-sm mt-1">{errors.primaryColor.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Biografia</label>
          <textarea
            {...register('bio')}
            rows={4}
            className="w-full p-2 border border-zinc-300 rounded focus:ring-2 focus:ring-black outline-none"
            placeholder="Conte um pouco sobre sua experiência e foco nos treinos..."
          />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </div>
  );
}
