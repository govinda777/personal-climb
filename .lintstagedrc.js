module.exports = {
  'client/**/*.{js,jsx,ts,tsx}': [
    'npm run lint --prefix client',
  ],
  'client/**/*.{ts,tsx}': [
    () => 'npm run type-check --prefix client',
  ],
};
