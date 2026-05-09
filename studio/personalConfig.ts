export default {
  name: 'personalConfig',
  type: 'document',
  title: 'Configuração do Personal',
  fields: [
    {
      name: 'brandName',
      type: 'string',
      title: 'Nome da Marca'
    },
    {
      name: 'primaryColor',
      type: 'string',
      title: 'Cor Primária (Hex)'
    },
    {
      name: 'heroTitle',
      type: 'string',
      title: 'Título Hero'
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      title: 'Subtítulo Hero'
    },
    {
      name: 'trainingPhilosophy',
      type: 'text',
      title: 'Metodologia / Filosofia de Treino'
    },
    {
      name: 'packages',
      type: 'array',
      title: 'Pacotes de Treino',
      of: [{ type: 'object', fields: [
        { name: 'name', type: 'string', title: 'Nome' },
        { name: 'price', type: 'string', title: 'Preço' },
        { name: 'features', type: 'array', of: [{ type: 'string' }], title: 'Destaques' }
      ]}]
    }
  ]
}
