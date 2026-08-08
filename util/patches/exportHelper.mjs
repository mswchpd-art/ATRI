// ESM 版 vue-loader exportHelper（替换 CommonJS 版，避免 outputModule 下 __webpack_require__ 未定义）
export default (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
