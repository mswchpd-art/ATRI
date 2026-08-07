<template>
  <div class="panel" :class="[stageStage, 好感度Class]">
    <!-- 第一行：名字 + 阶段 -->
    <div class="row top">
      <span class="name">拉亚</span>
      <span class="dot" :style="{ '--dot': stage.color }"></span>
      <span class="stage-name">{{ stage.name }}</span>
      <span class="stage-desc" v-if="stage.desc">{{ stage.desc }}</span>
    </div>

    <!-- 第二行：精神力渐变条 -->
    <div class="row">
      <span class="lbl">精神</span>
      <div class="track mind" :style="{ '--stage-c': stage.color }">
        <div class="fill" :style="{ width: pct(精神力) }"></div>
        <div class="ticks">
          <span v-for="(s, i) in stages" :key="i" class="tick" :style="{ left: s.left + '%' }"></span>
        </div>
      </div>
      <span class="num">{{ 精神力 }}</span>
    </div>

    <!-- 第三行：好感度条 -->
    <div class="row">
      <span class="lbl">好感</span>
      <div class="track heart" :class="{ low: 好感度 < 50, high: 好感度 >= 50 }">
        <div class="fill" :style="{ width: pct(好感度) }"></div>
        <div class="threshold" :style="{ left: '50%' }"></div>
      </div>
      <span class="num">{{ 好感度 }}</span>
    </div>

    <!-- 第四行：开发度三段 -->
    <div class="row dev">
      <span class="lbl">开发</span>
      <div class="dev-grid">
        <div v-for="k in ['小穴', '胸部', '后穴']" :key="k" class="dev-item" :class="{ broken: k === '小穴' && 开发度.小穴 > 0, flash: needFlash(k) }">
          <span class="dev-name">{{ k }}</span>
          <div class="dev-track"><div class="dev-fill" :style="{ width: pct(开发度[k]) }"></div></div>
          <span class="dev-num">{{ 开发度[k] || 0 }}</span>
        </div>
      </div>
    </div>
    <!-- 好感度≥50（h-high）时的左侧动态雾气层 -->
    <div class="fog" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from './store';

const store = useDataStore();

const 拉亚 = computed(() => store.data.拉亚);
const 精神力 = computed(() => 拉亚.value.精神力);
const 好感度 = computed(() => 拉亚.value.好感度);
const 开发度 = computed(() => 拉亚.value.开发度);

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pct = (v: number) => `${clamp(v, 0, 100)}%`;

// 精神力阶段（与 EJS_精神力阶段.yaml 一致）
// color 是当前阶段灯效色（竖条/dot/阶段名），冷→暖演进：冰蓝/冷青/琥珀金/珊瑚红/紫红
// desc 是 EJS 心理状态一行简述
const stages = [
  { min: 0,  max: 29,  name: '麻木崩坏', desc: '意识涣散', color: '#6e8ba8', left: 15 },
  { min: 30, max: 49,  name: '渐次失神', desc: '反应跟不上', color: '#6ba8a0', left: 40 },
  { min: 50, max: 74,  name: '惶惑矛盾', desc: '认知懵懂', color: '#c9a25a', left: 62 },
  { min: 75, max: 89,  name: '依靠矛盾', desc: '尝试依赖', color: '#d97a6e', left: 82 },
  { min: 90, max: 100, name: '清醒依赖', desc: '主动贴近', color: '#b86a8e', left: 95 },
];

const stage = computed(() => {
  const v = clamp(精神力.value, 0, 100);
  return stages.find(s => v >= s.min && v <= s.max) ?? stages[0];
});

// 给 panel 加阶段 data-class（控制主题色）
const stageStage = computed(() => `s-${stage.value.min}`);

// 好感度低/高两套装饰
const 好感度Class = computed(() => (好感度.value < 50 ? 'h-low' : 'h-high'));

// 小穴破处后闪烁触发（短时）
const needFlash = (k: string) => k === '小穴' && (开发度.value?.小穴 || 0) > 0;
</script>

<style lang="scss" scoped>
/* ============================================================
   背景板 V2：深冷画布 × 暖色灯效 × 局部异常色
   - 背景：所有阶段统一深冷基调（墨蓝黑/深靛蓝/冷灰黑），低饱和低亮度，安静当画布
   - 灯效（左侧竖条 + dot + 阶段名）：冷→暖 5 档，冰蓝/冷青/琥珀金/珊瑚红/紫红
   - 异常色只在局部边缘/环境光出现（径向光），不全局变暖
   - 越靠后阶段：边缘异常光略强，体现"心理侵入背景"
   ============================================================ */

.panel {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px 13px;
  /* 深冷默认底：墨蓝黑 → 冷灰黑，低饱和低亮度 */
  background:
    /* 顶部一点极弱的冷靛蓝环境光 */
    radial-gradient(120% 80% at 50% 0%, rgba(36, 44, 62, 0.5), transparent 60%),
    /* 主底：墨蓝黑 → 深靛蓝 → 冷灰黑 三层冷调 */
    linear-gradient(180deg, rgba(15, 18, 26, 0.92), rgba(12, 16, 24, 0.9) 55%, rgba(10, 12, 18, 0.94));
  border: 1px solid rgba(180, 200, 230, 0.05);
  border-left: none;
  border-radius: 5px;
  color: #c8ccd4;
  font-size: 12.5px;
  line-height: 1.45;
  letter-spacing: 0.01em;
  width: 100%;
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  position: relative;
  overflow: hidden;
  transition: background 1.1s ease, box-shadow 1.1s ease, border-color 1.1s ease;
  /* 极细边框 + 轻微内阴影，避免厚重感 */
  box-shadow:
    inset 0 0 0 1px rgba(180, 200, 230, 0.03),
    inset 0 1px 0 rgba(220, 232, 248, 0.03),
    inset 0 0 20px rgba(0, 0, 0, 0.4);
}

/* ---- 5 档灯效色（--accent：竖条 + dot + 阶段名 + 边缘异常光） ---- */
/* 冷 → 暖演进：冰蓝 → 冷青 → 琥珀金 → 珊瑚红 → 紫红 */
.panel.s-0  { --accent: #6e8ba8; --edge: rgba(110, 139, 168, 0.16); }
.panel.s-30 { --accent: #6ba8a0; --edge: rgba(107, 168, 160, 0.16); }
.panel.s-50 { --accent: #c9a25a; --edge: rgba(201, 162, 90, 0.18); }
.panel.s-75 { --accent: #d97a6e; --edge: rgba(217, 122, 110, 0.20); }
.panel.s-90 { --accent: #b86a8e; --edge: rgba(184, 106, 142, 0.22); }

/* ---- 局部边缘异常光：异常色像"心理状态侵入背景"，只在左侧边缘出现 ---- */
/* 各阶段在 .panel 深冷底上叠一层左侧局部径向光，色随 --edge，越后阶段越明显 */
.panel.s-30, .panel.s-50, .panel.s-75, .panel.s-90 {
  background:
    /* 左侧边缘的异常色环境光（局部，不全屏） */
    radial-gradient(60% 130% at 0% 50%, var(--edge), transparent 55%),
    /* 顶部极弱冷靛蓝环境光 */
    radial-gradient(120% 80% at 50% 0%, rgba(36, 44, 62, 0.5), transparent 60%),
    /* 深冷主底 */
    linear-gradient(180deg, rgba(15, 18, 26, 0.92), rgba(12, 16, 24, 0.9) 55%, rgba(10, 12, 18, 0.94));
  background-blend-mode: screen, screen, normal;
}

/* ---- 高阶段（75/90）：背景轻微"冷暖失衡"，右侧也透一点冷反差，体现冲突 ---- */
.panel.s-75, .panel.s-90 {
  background:
    radial-gradient(60% 130% at 0% 50%, var(--edge), transparent 55%),
    /* 右侧冷回：冷暖对峙感 */
    radial-gradient(50% 120% at 100% 50%, rgba(40, 60, 90, 0.22), transparent 60%),
    radial-gradient(120% 80% at 50% 0%, rgba(36, 44, 62, 0.5), transparent 60%),
    linear-gradient(180deg, rgba(15, 18, 26, 0.92), rgba(12, 16, 24, 0.9) 55%, rgba(10, 12, 18, 0.94));
  background-blend-mode: screen, screen, screen, normal;
}

/* ---- s-0 麻木崩坏：深冷底 + 真凹凸噪声 + 暗角，不再用暖紫浑浊底 ---- */
.panel.s-0 {
  background:
    /* 裂纹用窄径向椭圆做断点感 */
    radial-gradient(ellipse 38% 1.2% at 22% 18%, rgba(0,0,0,0.78) 30%, rgba(0,0,0,0.5) 60%, transparent 72%),
    radial-gradient(ellipse 30% 1% at 28% 38%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.38) 65%, transparent 75%),
    radial-gradient(ellipse 35% 1.1% at 18% 58%, rgba(0,0,0,0.66) 30%, rgba(0,0,0,0.42) 60%, transparent 72%),
    radial-gradient(ellipse 1.2% 42% at 62% 28%, rgba(0,0,0,0.72) 30%, rgba(0,0,0,0.48) 60%, transparent 72%),
    radial-gradient(ellipse 1% 30% at 56% 48%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.38) 65%, transparent 75%),
    /* 边缘一点冰蓝异常光（仍走冷色，崩坏态是最冷的冷） */
    radial-gradient(60% 130% at 0% 50%, var(--edge), transparent 55%),
    /* SVG 噪声：真不规则凹凸碎裂底噪 */
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"),
    /* 顶部极弱冷靛蓝 */
    radial-gradient(120% 80% at 50% 0%, rgba(36, 44, 62, 0.5), transparent 60%),
    /* 深冷主底 */
    linear-gradient(180deg, rgba(13, 16, 24, 0.95), rgba(9, 12, 18, 0.97));
  background-blend-mode: multiply, multiply, multiply, multiply, multiply, screen, screen, screen, normal;
  background-size: auto, auto, auto, auto, auto, auto, 200% 200%, auto, auto;
  border-color: rgba(110, 139, 168, 0.14);
  box-shadow:
    inset 0 0 26px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(220, 232, 248, 0.04),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4);
  color: #aeb4bd;
  animation: mind-collapse 2.4s ease-in-out infinite;
}
.panel.s-0 .name { color: #c0c6d0; }
.panel.s-0 .stage-name { opacity: 0.72; }

/* ---- 阶段竖条：伪元素，纵向渐变 + 辉光 + 流动光泽 ---- */
.panel::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--accent, #6e8ba8) 35%, transparent) 0%,
    var(--accent, #6e8ba8) 18%,
    color-mix(in srgb, var(--accent, #6e8ba8) 88%, #ffffff) 50%,
    var(--accent, #6e8ba8) 82%,
    color-mix(in srgb, var(--accent, #6e8ba8) 40%, transparent) 100%);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent, #6e8ba8) 55%, transparent);
  transition: background 0.9s ease, box-shadow 0.9s ease;
  z-index: 1;
}
.panel::after {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 3px;
  height: 22%;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.82), transparent);
  filter: blur(0.5px);
  opacity: 0.65;
  animation: bar-sheen 4.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: 2;
  pointer-events: none;
}
@keyframes bar-sheen {
  0%   { transform: translateY(-30%); opacity: 0; }
  18%  { opacity: 0.72; }
  82%  { opacity: 0.72; }
  100% { transform: translateY(420%); opacity: 0; }
}

/* ---- h-high：斯德哥尔摩依赖态（好感度≥50 的明显分界）。
   与 h-low 的差别要一眼可见：左侧暖灯效明显加重、整体叠一层暖意底、
   呼吸幅度加大、边框与文字带暖辉光。但暖仍是局部侵入，不全屏染暖 ---- */
.panel.h-high {
  background:
    /* 左侧边缘强暖异常光：心理暖意明显从 user 掌控侧侵入（45% 不透明度，75% 宽） */
    radial-gradient(75% 140% at 0% 50%,
      color-mix(in srgb, var(--accent, #b86a8e) 45%, transparent),
      color-mix(in srgb, var(--accent, #b86a8e) 28%, transparent) 35%,
      transparent 65%),
    /* 整体一层弱暖意底：冷底被暖压住，温差可见但不染全屏 */
    linear-gradient(95deg, rgba(58, 40, 46, 0.32), rgba(38, 36, 42, 0.16) 50%, rgba(22, 24, 30, 0.1)),
    /* 右侧冷回：保留冷暖对峙 */
    radial-gradient(50% 120% at 100% 50%, rgba(40, 60, 90, 0.28), transparent 60%),
    /* 顶部冷靛蓝环境光 */
    radial-gradient(120% 80% at 50% 0%, rgba(36, 44, 62, 0.5), transparent 60%),
    /* 深冷主底 */
    linear-gradient(180deg, rgba(15, 18, 26, 0.92), rgba(12, 16, 24, 0.9) 55%, rgba(10, 12, 18, 0.94));
  background-blend-mode: screen, screen, screen, screen, normal;
  /* 边框透暖光，比 h-low 的极细冷边更明显 */
  border-color: color-mix(in srgb, var(--accent, #b86a8e) 42%, transparent);
  /* 呼吸幅度加大，峰值更暖更亮 */
  animation: stockholm-breathe 4.8s ease-in-out infinite;
}
.panel.h-high .name { color: #ece8e9; text-shadow: 0 0 8px color-mix(in srgb, var(--accent, #b86a8e) 35%, transparent); }
.panel.h-high .stage-name { text-shadow: 0 0 8px color-mix(in srgb, var(--accent, #b86a8e) 55%, transparent); }

/* 斯德哥尔摩呼吸：左侧暖内辉光起伏幅度加大，让玩家察觉"它在呼吸" */
@keyframes stockholm-breathe {
  0%, 100% {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--accent, #b86a8e) 18%, transparent),
      inset 3px 0 16px color-mix(in srgb, var(--accent, #b86a8e) 15%, transparent),
      inset 0 1px 0 rgba(220, 232, 248, 0.04),
      inset 0 0 22px rgba(0, 0, 0, 0.42);
  }
  50% {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--accent, #b86a8e) 35%, transparent),
      inset 3px 0 28px color-mix(in srgb, var(--accent, #b86a8e) 38%, transparent),
      inset 0 1px 0 rgba(220, 232, 248, 0.08),
      inset 0 0 18px rgba(0, 0, 0, 0.36);
  }
}

/* ---- 好感度≥50 左侧雾团层。
   不用 SVG/纹理（会产生条纹和透明线），改用 3 个大径向光斑，
   各自缓慢游走 + 整体透明度呼吸，像大团雾气在左缘翻涌。
   只覆盖左侧 60%，screen 混合融入背景，不挡文字。
   靠近开发度/小穴的下方雾团更暗，纵向 mask 让亮度上亮下暗平滑过渡 ---- */
.panel .fog {
  display: none;
}
.panel.h-high .fog {
  display: block;
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 60%;
  pointer-events: none;
  z-index: 0;
  mix-blend-mode: screen;
  opacity: 0.55;
  background:
    radial-gradient(42% 58% at 24% 30%, color-mix(in srgb, var(--accent, #b86a8e) 26%, transparent), transparent 72%),
    radial-gradient(30% 44% at 40% 66%, color-mix(in srgb, var(--accent, #b86a8e) 11%, transparent), transparent 72%),
    radial-gradient(48% 60% at 6% 80%, color-mix(in srgb, var(--accent, #b86a8e) 7%, transparent), transparent 72%);
  background-size: 150% 160%, 130% 150%, 170% 180%;
  background-repeat: no-repeat;
  /* 纵向亮度过渡：上部亮、向下平滑渐暗，雾团间无硬切 */
  -webkit-mask-image: linear-gradient(180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.9) 40%,
    rgba(0, 0, 0, 0.55) 70%,
    rgba(0, 0, 0, 0.3) 100%);
  mask-image: linear-gradient(180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.9) 40%,
    rgba(0, 0, 0, 0.55) 70%,
    rgba(0, 0, 0, 0.3) 100%);
  animation: fog-drift 40s ease-in-out infinite;
}

@keyframes fog-drift {
  0% {
    background-position: 0% 0%, 30% 10%, 8% 4%;
    opacity: 0.5;
  }
  50% {
    background-position: 14% 8%, 44% -2%, 26% 12%;
    opacity: 0.68;
  }
  100% {
    background-position: 0% 0%, 30% 10%, 8% 4%;
    opacity: 0.5;
  }
}

/* ==================== 行布局 ==================== */
.row {
  display: flex;
  align-items: center;
  gap: 9px;

  &.top { gap: 7px; }
  &.dev .lbl { width: auto; }
}

/* 第一行 */
.name {
  font-weight: 600;
  font-size: 13px;
  color: #dde0e8;
  letter-spacing: 0.06em;
}
.dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--dot, #6e8ba8);
  box-shadow: 0 0 6px var(--dot, #6e8ba8);
  flex: none;
  margin: 0 1px;
}
.stage-name {
  color: var(--accent);
  font-weight: 500;
  font-size: 12.5px;
  letter-spacing: 0.05em;
}
.stage-desc {
  margin-left: auto;
  color: rgba(200, 204, 212, 0.42);
  font-size: 11px;
  letter-spacing: 0.04em;
}

/* 通用进度条 */
.lbl {
  flex: none;
  width: 24px;
  color: rgba(200, 204, 212, 0.48);
  font-size: 11.5px;
  letter-spacing: 0.08em;
}
.num {
  flex: none;
  width: 22px;
  text-align: right;
  color: #dde0e8;
  font-size: 12.5px;
}

.track {
  flex: 1;
  height: 6px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* 精神力条：底用低饱和冷色刻度，fill 用 5 档灯效色渐变 */
.mind {
  background: linear-gradient(90deg,
    rgba(110, 139, 168, 0.10) 0%,
    rgba(107, 168, 160, 0.10) 30%,
    rgba(201, 162, 90, 0.10)  55%,
    rgba(217, 122, 110, 0.10) 78%,
    rgba(184, 106, 142, 0.10) 100%);
}
.mind .fill {
  background: linear-gradient(90deg,
    #6e8ba8 0%, #6ba8a0 30%, #c9a25a 55%, #d97a6e 78%, #b86a8e 100%);
}
.ticks { position: absolute; inset: 0; }
.tick {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: rgba(0, 0, 0, 0.35);
}

/* 好感度条：低好感冷灰，高好感暖渐变 */
.heart .fill { background: #6e8ba8; }
.heart.low .fill {
  background: #6e8ba8; /* 低好感：冷灰蓝，被动承受 */
}
.heart.high .fill {
  background: linear-gradient(90deg, #c9a25a 0%, #b86a8e 100%); /* 高好感：暖，依赖 */
}
.threshold {
  position: absolute; top: -2px; bottom: -2px; width: 1px;
  background: rgba(220, 232, 248, 0.18);
}

/* 开发度三段 */
.dev-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.dev-item {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 3px;
}
.dev-name {
  font-size: 11px;
  color: rgba(200, 204, 212, 0.55);
  letter-spacing: 0.04em;
  flex: none;
  width: 28px;
}
.dev-track {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}
.dev-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #6b7480 0%, #b86a8e 100%);
  transition: width 0.4s ease;
}
.dev-item.broken .dev-name { color: #d97a6e; }
.dev-num {
  flex: none;
  width: 16px;
  text-align: right;
  font-size: 11.5px;
  color: rgba(200, 204, 212, 0.85);
}

/* 小穴破处闪烁 */
@keyframes broken-flash {
  0%   { box-shadow: 0 0 0 0 rgba(217, 122, 110, 0.0); }
  30%  { box-shadow: 0 0 10px 1px rgba(217, 122, 110, 0.55); }
  100% { box-shadow: 0 0 0 0 rgba(217, 122, 110, 0.0); }
}
.dev-item.flash { animation: broken-flash 1.2s ease-out 1; }

/* 阶段切换平滑 */
.panel.s-0, .panel.s-30, .panel.s-50, .panel.s-75, .panel.s-90,
.panel.h-high {
  transition: background 1.1s ease, box-shadow 1.1s ease, border-color 1.1s ease;
}
.stage-name, .dot {
  transition: color 0.9s ease, background 0.9s ease, box-shadow 0.9s ease;
}

/* s-0 颤动 */
@keyframes mind-collapse {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-0.3px); }
  75% { transform: translateX(0.3px); }
}
</style>