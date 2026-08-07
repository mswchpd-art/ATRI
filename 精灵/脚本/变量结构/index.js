import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

// 拉亚 MVU 变量结构（自包含，供酒馆助手脚本库直接加载）
// 与 精灵/schema.ts 保持一致。注意：z 与 _ 为全局注入，不可 import。
const Schema = z.object({
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

$(() => {
  registerMvuSchema(Schema);
});
