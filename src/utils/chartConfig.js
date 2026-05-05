export const chartColors = {
  feelings: '#f97316', // Orange
  safety: '#14b8a6', // Teal
  weight: '#8b5cf6' // Purple
}

export const chartConfig = {
  feelings: {
    color: chartColors.feelings,
    name: 'Feelings Score (1-10)',
    yAxisId: 'right',
    domain: [0, 10]
  },
  safety: {
    color: chartColors.safety,
    name: 'Meal Safety %',
    yAxisId: 'left',
    domain: [0, 100]
  },
  weight: {
    color: chartColors.weight,
    name: 'Weight (kg)',
    yAxisId: 'right',
    domain: null // Auto-scale
  }
}
