const fs = require('fs');

function fixFile(filePath, search, replace) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(search, replace);
  fs.writeFileSync(filePath, code);
}

// Fix anamnesis: consentTermsSigned Literal errorMap and coerce numbers type
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /consentTermsSigned: z\.literal\(true, \{\n\s*errorMap: \(\) \=\> \(\{ message: 'Você precisa aceitar os termos\.' \}\),\n\s*\}\)/g,
  "consentTermsSigned: z.boolean().refine(val => val === true, { message: 'Você precisa aceitar os termos.' })"
);
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /weight: z\.coerce\.number\(\)\.min\(30, 'Peso inválido\.'\)/g,
  "weight: z.number({ coerce: true }).min(30, 'Peso inválido.')"
);
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /height: z\.coerce\.number\(\)\.min\(100, 'Altura inválida \(em cm\)\.'\)/g,
  "height: z.number({ coerce: true }).min(100, 'Altura inválida (em cm).')"
);
fixFile('client/src/app/(athlete)/athlete/onboarding/page.tsx',
  /sleepHours: z\.coerce\.number\(\)\.min\(2\)\.max\(15\)/g,
  "sleepHours: z.number({ coerce: true }).min(2).max(15)"
);

// Fix workout RPE coerce
fixFile('client/src/app/(athlete)/athlete/workout/page.tsx',
  /rpe: z\.coerce\.number\(\)\.int\(\)\.min\(1\)\.max\(10, 'RPE deve ser entre 1 e 10'\)/g,
  "rpe: z.number({ coerce: true }).int().min(1).max(10, 'RPE deve ser entre 1 e 10')"
);

// Fix Schedule coerce
fixFile('client/src/app/(professor)/professor/dashboard/schedule/page.tsx',
  /maxCapacity: z\.coerce\.number\(\)\.int\(\)\.min\(1, 'A capacidade deve ser pelo menos 1\.'\)/g,
  "maxCapacity: z.number({ coerce: true }).int().min(1, 'A capacidade deve ser pelo menos 1.')"
);

// Fix Protocol form defaultValues types match
fixFile('client/src/app/(professor)/professor/dashboard/protocol/page.tsx',
  /evaluationMetrics: z\.object\(\{\n\s*focusOnEndurance: z\.boolean\(\)\.default\(false\),\n\s*focusOnPower: z\.boolean\(\)\.default\(false\),\n\s*focusOnMobility: z\.boolean\(\)\.default\(false\),\n\s*allowedEquipment: z\.array\(z\.string\(\)\)\.default\(\[\]\),\n\s*\}\)/g,
  `evaluationMetrics: z.object({
    focusOnEndurance: z.boolean(),
    focusOnPower: z.boolean(),
    focusOnMobility: z.boolean(),
    allowedEquipment: z.array(z.string()),
  })`
);
