const fs = require('fs');

function fixFile(filePath, search, replace) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(search, replace);
  fs.writeFileSync(filePath, code);
}

// Fix anamnesis
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /weight: z\.number\(\{ coerce: true \}\)\.min\(30, 'Peso inválido\.'\)/g,
  "weight: z.any().transform(Number).refine(val => val >= 30, 'Peso inválido.')"
);
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /height: z\.number\(\{ coerce: true \}\)\.min\(100, 'Altura inválida \(em cm\)\.'\)/g,
  "height: z.any().transform(Number).refine(val => val >= 100, 'Altura inválida (em cm).')"
);
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /sleepHours: z\.number\(\{ coerce: true \}\)\.min\(2\)\.max\(15\)/g,
  "sleepHours: z.any().transform(Number).refine(val => val >= 2 && val <= 15, 'Entre 2 e 15 horas.')"
);

// Fix workout RPE coerce
fixFile('client/src/app/(athlete)/athlete/workout/page.tsx',
  /rpe: z\.number\(\{ coerce: true \}\)\.int\(\)\.min\(1\)\.max\(10, 'RPE deve ser entre 1 e 10'\)/g,
  "rpe: z.any().transform(Number).refine(val => Number.isInteger(val) && val >= 1 && val <= 10, 'RPE deve ser entre 1 e 10')"
);

// Fix Schedule coerce
fixFile('client/src/app/(professor)/professor/dashboard/schedule/page.tsx',
  /maxCapacity: z\.number\(\{ coerce: true \}\)\.int\(\)\.min\(1, 'A capacidade deve ser pelo menos 1\.'\)/g,
  "maxCapacity: z.any().transform(Number).refine(val => Number.isInteger(val) && val >= 1, 'A capacidade deve ser pelo menos 1.')"
);
