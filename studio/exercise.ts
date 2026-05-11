export default {
  name: 'exercise',
  type: 'document',
  title: 'Biblioteca de Exercícios',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Nome do Exercício',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      type: 'text',
      title: 'Descrição Técnica'
    },
    {
      name: 'videoUrl',
      type: 'url',
      title: 'URL do Vídeo Demonstrativo (ex: YouTube/Vimeo)'
    },
    {
      name: 'category',
      type: 'string',
      title: 'Categoria',
      options: {
        list: [
          { title: 'Força de Dedos', value: 'finger_strength' },
          { title: 'Mobilidade', value: 'mobility' },
          { title: 'Core', value: 'core' },
          { title: 'Técnica de Pés', value: 'footwork' },
          { title: 'Potência', value: 'power' },
          { title: 'Resistência', value: 'endurance' }
        ]
      }
    },
    {
      name: 'equipment',
      type: 'array',
      title: 'Equipamentos Necessários',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Hangboard', value: 'hangboard' },
          { title: 'Campus Board', value: 'campus_board' },
          { title: 'Muro de Boulder', value: 'boulder_wall' },
          { title: 'Pesos Livres', value: 'free_weights' },
          { title: 'Elásticos', value: 'bands' }
        ]
      }
    },
    {
      name: 'tips',
      type: 'array',
      title: 'Dicas de Execução',
      of: [{ type: 'string' }]
    }
  ]
}
