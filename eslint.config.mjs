import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["node_modules/**", ".next/**", "src/generated/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Les textes affichés sont en français et contiennent de nombreuses
      // apostrophes : les échapper en entités HTML nuirait à la lisibilité du
      // code sans bénéfice réel.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
