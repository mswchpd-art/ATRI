// 拉亚变量约束：好感度上限受精神力门槛控制
// 精神力 <75 时，好感度上限钳制为 49；精神力 ≥75 后好感度可突破到 100
await waitGlobalInitialized('Mvu');

eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variables => {
  const 精神力 = _.get(variables, 'stat_data.拉亚.精神力', 0);
  const 好感度 = _.get(variables, 'stat_data.拉亚.好感度', 0);

  if (精神力 < 75 && 好感度 > 49) {
    _.set(variables, 'stat_data.拉亚.好感度', 49);
  }
});
