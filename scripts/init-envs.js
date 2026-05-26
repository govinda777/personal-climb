const fs = require("fs");
const path = require("path");

const envs = [
  {
    example: path.join(__dirname, "../server/.env.example"),
    target: path.join(__dirname, "../server/.env"),
  },
  {
    example: path.join(__dirname, "../client/.env.example"),
    target: path.join(__dirname, "../client/.env.local"),
  },
];

console.log("🚀 Initializing environment files...");

envs.forEach(({ example, target }) => {
  if (!fs.existsSync(target)) {
    if (fs.existsSync(example)) {
      fs.copyFileSync(example, target);
      console.log(
        `✅ Created ${path.relative(path.join(__dirname, ".."), target)} from example.`,
      );
    } else {
      console.warn(`⚠️ Warning: Example file not found at ${example}`);
    }
  } else {
    console.log(
      `ℹ️  ${path.relative(path.join(__dirname, ".."), target)} already exists, skipping.`,
    );
  }
});

console.log("✨ Environment setup complete.");
