// 拉亚 MVU 变量结构（src/精灵前端 调试用，与 精灵/schema.ts 保持一致）
// 注意：z 与 _ 为 webpack unplugin-auto-import 全局注入，无需 import。
// 修改变量结构时，请同步修改 精灵/schema.ts。
export const Schema = z.object({
  拉亚: z.object({
    精神力: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(60),
    好感度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    开发度: z
      .object({
        小穴: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        胸部: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
        后穴: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
      })
      .prefault({}),
  }),
});
export type Schema = z.output<typeof Schema>;