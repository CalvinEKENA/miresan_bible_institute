import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "functions/**", "public/sw.js", "next-env.d.ts", "coverage/**", "playwright-report/**"],
  },
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
    },
  },
  {
    files: ["scripts/**/*.ts", "scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
];

export default config;
