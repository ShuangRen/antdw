/**
 * rollup 配置
 * */
import * as path from 'path';
import * as fs from 'fs';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import image from '@rollup/plugin-image';
// import eslint from '@rollup/plugin-eslint';
import styles from 'rollup-plugin-styles';
import {terser} from 'rollup-plugin-terser';
import autoprefixer from 'autoprefixer';
import clear from "rollup-plugin-clear";
import typescript from 'rollup-plugin-typescript2';

const entryFile = 'src/index.ts';
const outFile = 'lib';
const BABEL_ENV = process.env.BABEL_ENV || 'umd';
const extensions = ['.js', '.ts', '.tsx'];
const globals = {react: 'React', 'react-dom': 'ReactDOM'};
const externalPkg = ['react', 'react-dom', 'lodash', 'react-router-dom', 'react-router', 'antd'];
BABEL_ENV !== 'umd' && externalPkg.push('@babel/runtime');
const external = id => externalPkg.some(e => id.indexOf(e) === 0);
const componentDir = 'src/components';
const cModuleNames = fs.readdirSync(path.resolve(componentDir));
const componentEntryFiles = cModuleNames.map((name) => /^[A-Z]\w*/.test(name) ? `${componentDir}/${name}/index.tsx` : undefined).filter(n => !!n);

const commonPlugins = [
  typescript({
    tsconfig: 'tsconfig.json', // 导入本地ts配置
    extensions
  }),
  image(),
  // eslint({fix: true, exclude: ['*.less', '*.png', '*.svg']}),
  resolve({ extensions }),
  babel({
    exclude: 'node_modules/**', // 只编译源代码
    babelHelpers: 'runtime',
    extensions,
    skipPreflightCheck: true
  }),
  // 全局变量替换
  replace({
    preventAssignment: true,
    exclude: 'node_modules/**',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  }),
  commonjs(),
];
const stylePluginConfig = {
  mode: "extract",
  less: {javascriptEnabled: true},
  extensions: ['.less', '.css'],
  minimize: false,
  use: ['less'],
  url: {
    inline: true
  },
  plugins: [autoprefixer({env: BABEL_ENV})]
};
const umdOutput = {
  format: 'umd',
  name: 'RollupUI',
  globals,
  assetFileNames: '[name].[ext]'
};
const esOutput = {
  globals,
  preserveModules: true,
  preserveModulesRoot: 'src/components',
  exports: 'named',
  assetFileNames: ({name}) => {
    const {ext, dir, base} = path.parse(name);
    if (ext !== '.css') return '[name].[ext]';
    // 规范 style 的输出格式
    return path.join(dir, 'style', base);
  },
}
const esStylePluginConfig = {
  ...stylePluginConfig,
  sourceMap: true, // 必须开启，否则 rollup-plugin-styles 会有 bug
  onExtract(data) {
    // 一下操作用来确保只输出一个 index.css
    const {css, name, map} = data;
    const {base} = path.parse(name);
    if (base !== 'index.css') return false;
    return true;
  }
}

export default () => {
  switch (BABEL_ENV) {
    case 'umd':
      return [{
        input: entryFile,
        output: {...umdOutput, file: outFile + '/umd/antdw.development.js'},
        external,
        plugins: [styles(stylePluginConfig), ...commonPlugins]
      }, {
        input: entryFile,
        output: {...umdOutput, file: outFile + '/umd/antdw.production.min.js', plugins: [terser()]},
        external,
        plugins: [clear({targets: [outFile + '/umd']}), styles({...stylePluginConfig, minimize: true}), ...commonPlugins]
      }];
    case 'esm':
      return {
        input: [entryFile, ...componentEntryFiles],
        preserveModules: true, // rollup-plugin-styles 还是需要使用
        output: { ...esOutput, dir: outFile + '/es', format: 'es'},
        external,
        plugins: [clear({targets: [outFile + '/es']}), styles(esStylePluginConfig), ...commonPlugins]
      };
    case 'cjs':
      return {
        input: [entryFile, ...componentEntryFiles],
        preserveModules: true, // rollup-plugin-styles 还是需要使用
        output: { ...esOutput, dir: outFile + '/cjs', format: 'cjs'},
        external,
        plugins: [clear({targets: [outFile + '/cjs']}), styles(esStylePluginConfig), ...commonPlugins]
      };
    default:
      return [];
  }
};