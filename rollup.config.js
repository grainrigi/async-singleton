import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist-cjs',
      format: 'cjs',
    },
    {
      dir: 'dist-esm',
      format: 'es',
    },
  ],
  plugins: [
    resolve(),
    typescript(),
  ],
}