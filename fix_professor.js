const fs = require('fs');
let code = fs.readFileSync('server/src/api/professor.ts', 'utf8');

code = code.replace(/const planApprovalSchema = z\.object\(\{\n\s*status: z\.enum\(\['approved', 'draft', 'rejected'\]\),\n\s*aiRationale: z\.string\(\)\.optional\(\)\n\}\)/g,
`const planApprovalSchema = z.object({
  status: z.enum(['approved', 'draft', 'rejected']),
  aiRationale: z.string().optional()
})`);

code = code.replace(/const \{ status,\n      \.\.\.\(aiRationale !== undefined \&\& \{ aiRationale \}\), aiRationale \} = c\.req\.valid\('json'\)/g,
`const { status, aiRationale } = c.req.valid('json')`);

fs.writeFileSync('server/src/api/professor.ts', code);
