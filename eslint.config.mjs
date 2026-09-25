import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  // La vitrine (vitrine/) est une application séparée, avec sa propre config.
  { ignores: ["node_modules/**", ".next/**", "src/generated/**", "vitrine/**"] },
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
