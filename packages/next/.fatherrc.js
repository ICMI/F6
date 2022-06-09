
let entry = ['./src/index.ts'];

export default {
  entry,
  esm: 'babel',
  cjs: 'babel',
  extraBabelPlugins: ['@babel/plugin-proposal-class-static-block'],

};
