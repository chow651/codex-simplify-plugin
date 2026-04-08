# Simplify Modes And Closure Outcomes Design

**Goal:** 在 `codex-simplify-plugin` 中正式落地三档模式、客观触发信号、`no cleanup needed` 正向出口、真实案例与 README 结果导向说明。

## Current Facts

- 仓库已经在 [README.md](G:/clawbot/projects/codex-simplify-plugin/README.md)、[skills/using-simplify/SKILL.md](G:/clawbot/projects/codex-simplify-plugin/skills/using-simplify/SKILL.md)、[skills/simplify/SKILL.md](G:/clawbot/projects/codex-simplify-plugin/skills/simplify/SKILL.md)、[examples/AGENTS.snippet.md](G:/clawbot/projects/codex-simplify-plugin/examples/AGENTS.snippet.md)、[scripts/simplify_stop_gate.py](G:/clawbot/projects/codex-simplify-plugin/scripts/simplify_stop_gate.py) 中写入了部分规则。
- 现有规则已经出现 `Lite / Standard / Strict`、`no cleanup needed`、部分 Strict 信号，但三者之间还没有形成完整闭环。
- [README.md](G:/clawbot/projects/codex-simplify-plugin/README.md) 仍把真实案例留在占位描述，仓库内没有可引用的案例文件。
- `simplify_stop_gate.py` 当前只实现了“Strict 信号命中时阻断、1 到 2 个局部文件直接放行”的粗粒度判定，没有覆盖完整模式矩阵，也没有测试保护。

## Primary Line

本轮唯一主线是把收尾协议从“规则草稿”推进到“可执行、可引用、可验证”的版本。

交付结果必须让使用者清楚回答四个问题：

1. 什么时候跳过 `simplify`
2. 什么时候进入 `Lite`、`Standard`、`Strict`
3. 什么时候可以给出 `no cleanup needed`
4. 真实任务结束时应该怎样报告结果

## Non-Goals

- 不重构安装器
- 不新增新的 skill 目录结构
- 不改插件发布方式
- 不把 hook 做成强制自动模式判定器
- 不在本轮扩展 `README.zh-CN.md`

## Design Decisions

### 1. Layer Responsibilities

- `using-simplify` 负责路由：判断 skip、模式归类、进入 `simplify` 的条件。
- `simplify` 负责执行：分类任务、选择轨道、收敛发现、决定 `no cleanup needed` 或修正问题、重跑验证、输出结果。
- `AGENTS.snippet` 负责把上述规则压缩成用户可复制的门槛说明。
- `simplify_stop_gate.py` 负责保守拦截：阻止明显未完成的收尾，但不替代主线程判断。
- `README.md` 负责结果导向说明：告诉用户这套协议最终会产出什么，以及如何快速采用。
- `examples/*.md` 负责把抽象规则变成真实场景案例。

### 2. Objective Signal Matrix

模式判断以当前任务相关 diff 为基础，按以下顺序执行：

1. 先看是否满足 skip 信号
2. 不满足 skip 时，判断是否满足 Strict 信号
3. 不满足 Strict 时，判断是否满足 Lite 信号
4. 其余情况统一进入 Standard

矩阵定义：

| Outcome | Signal |
|---|---|
| Skip | 只有文档、注释、格式化、无行为影响元数据、无关生成产物 |
| Lite | 1 到 2 个局部文件；无共享模块；无配置、依赖、hook、插件清单改动；无需扩大验证范围 |
| Standard | 普通 feature / bugfix / refactor；不属于 Lite，也未命中 Strict |
| Strict | 6 个及以上文件；配置变更；依赖变更；测试改动扩大验证范围；共享模块变更；hook 或插件清单变更；跨多个调用面改变用户可见行为 |

### 3. Positive Exit

`no cleanup needed` 是有效结论，但必须绑定证据。

证据模板固定为四类：

- 改动局部，没有扩大表面积
- 沿用仓库已有模式，没有新增冗余抽象、状态或分支
- 没有重复已有能力
- 受影响路径已经被足够验证覆盖

只有当 triage 后没有真实 `must_fix` 或值得处理的 `fix_if_cheap` 问题时，才能给出该结论。

### 4. Stop Hook Strategy

hook 只做保守阻断，不做完整裁决。

目标行为：

- skip 场景直接放行
- 明显 Lite 场景放行，避免过度打断
- Standard 与 Strict 场景在没有 `using-simplify` 证据时阻断
- 已出现 `simplify` 结果摘要与结论字段时放行

这样可以把“轻量改动的低噪声体验”和“真正收尾门槛”同时保住。

### 5. Worked Examples

新增四个案例文件，直接对应用户关心的四类结果：

- `examples/feature-standard-closure.md`
- `examples/bugfix-closure.md`
- `examples/lite-no-cleanup-needed.md`
- `examples/strict-closure.md`

每个案例都使用同一结构：

1. 任务背景
2. 改动文件
3. 模式判断
4. 任务类型
5. 审查轨道
6. 发现与收敛结果
7. 验证命令
8. 最终收尾话术

### 6. README Outcome Framing

README 不再停留在“协议有什么概念”，而是明确强调：

- 你会得到哪种收尾结果
- 何时进入哪种模式
- 何时可以正当结束为 `no cleanup needed`
- 去哪里看真实案例

## Risks And Controls

### 风险 1

脚本判定与文档定义不一致。

控制方式：先写测试覆盖 `simplify_stop_gate.py` 的关键路径，再按测试改脚本与文档。

### 风险 2

`Strict` 定义过宽，导致 hook 噪声过大。

控制方式：脚本只依据高风险信号和非 Lite 条件保守阻断，不尝试自动细分全部场景。

### 风险 3

`no cleanup needed` 沦为空泛结论。

控制方式：在 skill、AGENTS 片段、README、案例文件中统一证据模板，并在 hook 放行文案中要求结果说明。

## Verification Path

- 为 [scripts/simplify_stop_gate.py](G:/clawbot/projects/codex-simplify-plugin/scripts/simplify_stop_gate.py) 新增单元测试，覆盖 skip、Lite 放行、Standard 阻断、Strict 阻断、已有 simplify 证据放行。
- 文档层面核对 [README.md](G:/clawbot/projects/codex-simplify-plugin/README.md)、[skills/using-simplify/SKILL.md](G:/clawbot/projects/codex-simplify-plugin/skills/using-simplify/SKILL.md)、[skills/simplify/SKILL.md](G:/clawbot/projects/codex-simplify-plugin/skills/simplify/SKILL.md)、[examples/AGENTS.snippet.md](G:/clawbot/projects/codex-simplify-plugin/examples/AGENTS.snippet.md) 的模式与术语一致。
- 通过 README 链接把真实案例接入仓库入口，不再保留“下个版本补齐”类占位表述。

## Acceptance Criteria

- 三档模式、客观信号、正向出口在 skill、AGENTS 片段、README 中定义一致。
- hook 脚本行为有测试保护，且与模式设计相符。
- 仓库新增四个真实案例文件，README 可直接跳转。
- README 删除案例占位承诺，改为真实链接。
