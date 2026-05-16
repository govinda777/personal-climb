const fs = require('fs');
let code = fs.readFileSync('server/src/api/professor.ts', 'utf8');

code = code.replace(
  "const planApprovalSchema = z.object({\n  status,\n      ...(aiRationale !== undefined && { aiRationale }): z.enum(['approved', 'draft', 'rejected']) // Simplify for now\n})",
  "const planApprovalSchema = z.object({\n  status: z.enum(['approved', 'draft', 'rejected']),\n  aiRationale: z.string().optional()\n})"
);

code = code.replace(
  "const pendingPlansCount = pendingPlansList.filter(p => p.status,\n      ...(aiRationale !== undefined && { aiRationale }) === 'draft').length",
  "const pendingPlansCount = pendingPlansList.filter(p => p.status === 'draft').length"
);

code = code.replace(
  "status,\n      ...(aiRationale !== undefined && { aiRationale }): pendingPlansList.some(p => p.athleteId === a.id && p.status === 'draft') ? 'pending' : 'active',",
  "status: pendingPlansList.some(p => p.athleteId === a.id && p.status === 'draft') ? 'pending' : 'active',"
);

fs.writeFileSync('server/src/api/professor.ts', code);
