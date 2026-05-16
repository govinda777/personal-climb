const fs = require('fs');

// 1. Fix the last undefined object issue
let profCode = fs.readFileSync('server/src/api/professor.ts', 'utf8');
profCode = profCode.replace("athleteList[0].userId", "athleteList[0]!.userId");
fs.writeFileSync('server/src/api/professor.ts', profCode);

// 2. Fix the Vercel Edge Function unsupported modules issue (pg vs @neondatabase/serverless)
// The issue states it doesn't support 'pg' module on Vercel Edge.
// We must migrate our db initialization to a standard node runtime or use edge compatible imports.
// It's often easiest to just switch the vercel API config to 'nodejs' runtime if 'pg' is being used.

let indexCode = fs.readFileSync('server/api/index.ts', 'utf8');
indexCode = indexCode.replace("runtime: 'edge'", "runtime: 'nodejs'");
fs.writeFileSync('server/api/index.ts', indexCode);
