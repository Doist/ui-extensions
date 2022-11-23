import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import svgr from '@svgr/rollup'

module.exports = {
    input: ['src/index.ts'],
    output: {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
    },
    plugins: [
        typescript({ tsconfig: 'tsconfig.build.json' }),
        postcss({ extract: true }),
        nodeResolve(),
        peerDepsExternal(),
        commonjs(),
        svgr(),
    ],
    external: ['classnames'],
}
