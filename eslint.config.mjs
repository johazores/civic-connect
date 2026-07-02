import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      // This app intentionally loads dashboard data after mount through API routes.
      'react-hooks/set-state-in-effect': 'off'
    }
  }
];

export default eslintConfig;
