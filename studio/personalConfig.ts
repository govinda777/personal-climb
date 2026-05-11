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
      name: 'logo',
      type: 'image',
      title: 'Logotipo',
      options: {
        hotspot: true
      }
    },
    {
      name: 'primaryColor',
      type: 'string',
      title: 'Cor Primária (Hex)'
    },
    {
      name: 'secondaryColor',
      type: 'string',
      title: 'Cor Secundária (Hex)'
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
      name: 'consentTerms',
      type: 'text',
      title: 'Termos de Consentimento Customizados',
      description: 'Texto legal de anamnese e uso de dados'
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
