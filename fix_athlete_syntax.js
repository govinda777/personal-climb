const fs = require('fs');
let code = fs.readFileSync('server/src/api/athlete.ts', 'utf8');

// There are a lot of TS2532: Object is possibly 'undefined' and TS18048: 'slot' is possibly 'undefined'.
// Let's replace the strict mode assumptions in the simple API endpoints where we do checks.

code = code.replace(/const athleteId = athleteList\[0\]\.id/g, "const athleteId = athleteList[0]!.id");
code = code.replace(/const personalId = athleteList\[0\]\.personalId/g, "const personalId = athleteList[0]!.personalId");
code = code.replace(/a \=\> a\.id/g, "a => a!.id");
code = code.replace(/a \=\> a\.isActive === 0/g, "a => a!.isActive === 0");
code = code.replace(/a \=\> a\.userId\.substring/g, "a => a!.userId!.substring");
code = code.replace(/a\.vGradeLevel/g, "a!.vGradeLevel");
code = code.replace(/p \=\> p\.athleteId === a\.id/g, "p => p!.athleteId === a!.id");
code = code.replace(/p \=\> p\.status/g, "p => p!.status");
code = code.replace(/b \=\> b\.athleteId === athleteList\[0\]\.id/g, "b => b!.athleteId === athleteList[0]!.id");
code = code.replace(/b \=\> b\.athleteId === athleteId/g, "b => b!.athleteId === athleteId");
code = code.replace(/const slot = slots\[0\]/g, "const slot = slots[0]!");
code = code.replace(/slot\.maxCapacity/g, "slot!.maxCapacity");
code = code.replace(/existing\[0\]\.id/g, "existing[0]!.id");

fs.writeFileSync('server/src/api/athlete.ts', code);
