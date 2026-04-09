# Codex Simplify

[![Skill-first](https://img.shields.io/badge/shape-skill--first-111111?style=flat-square)](./skills/simplify/SKILL.md)
[![Windows](https://img.shields.io/badge/windows-AGENTS%20gate-0A7A3F?style=flat-square)](./examples/AGENTS.snippet.md)
[![macOS%2FLinux](https://img.shields.io/badge/macos%2Flinux-optional%20Stop%20hook-1F6FEB?style=flat-square)](./examples/codex.hooks.json)

[English README](./README.md)

> 面向 Codex 收尾阶段的 skill-first 清理协议。<br>
> 在任务结束前，把代码任务再收紧一轮。

`simplify` 的主产品形态是 **Codex skill**。插件层主要负责安装和分发，真正有价值的核心，是那份在任务收尾时执行维护债清理协议的 skill。

## 一眼看懂

| 项目 | 默认理解 |
|---|---|
| 入口 skill | [`skills/using-simplify/SKILL.md`](./skills/using-simplify/SKILL.md) |
| 清理协议 | [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) |
| 审查模式 | Lite / Standard / Strict |
| Windows 最优路径 | skill + `AGENTS.md` gate |
| macOS / Linux 最优路径 | skill + `AGENTS.md` gate + 可选 `Stop` hook |
| plugin 的意义 | 降低安装和分发成本 |

## 它做什么

当代码任务进入收尾阶段，分层后的工作流是：

- `using-simplify` 负责识别收尾条件
- `simplify` 负责执行清理协议

具体的清理协议会要求主 agent：

- 先把任务归类为 `feature`、`refactor`、`bugfix`
- 再按任务类型选择正确审查轨道
- 再把问题收敛到 `must_fix`、`fix_if_cheap`、`note_only`
- 最后重新验证，再决定是否结束

核心审查轨道：

- `repo_fit`
- `quality`
- `reuse`
- `blast_radius`
- `efficiency`

其中 `efficiency` 只在性能相关场景下加入。

## 审查模式

| 模式 | 适用场景 | 结果 |
|---|---|---|
| `Skip` | 没有有效的行为性改动 | 明确写出跳过依据 |
| `Lite` | 小范围、低风险、局部改动 | 短审查 + 最小必要验证 |
| `Standard` | 正常 feature / bugfix / refactor 收尾 | 执行标准清理协议 |
| `Strict` | 高风险或大范围改动 | 提高审查强度与验证范围 |

`Skip` 和 `无需清理` 不是一回事：

- `Skip`：没有值得进入 simplify 的目标
- `无需清理`：已经运行了 simplify，但没有发现值得处理的问题

`Strict` 的客观触发信号包括：

- 改动 6 个及以上文件
- 改动构建或运行配置
- 改动依赖清单
- 改动共享或公共模块
- 改动测试并扩大验证范围
- 改动 hook 或插件清单
- 跨多个调用面改变用户可见行为

`无需清理` 只有在这些证据都成立时才有效：

- 改动保持局部
- 沿用仓库已有模式
- 没有新增不必要的抽象、状态或重复实现
- 受影响路径已有足够验证

## 快速开始

### 安装 Skill 套件

Windows PowerShell：

```powershell
irm https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.ps1 | iex
```

macOS / Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.sh | bash
```

### 安装并启用收尾 Gate

Windows PowerShell：

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.ps1))) -WithGate
```

macOS / Linux：

```bash
curl -fsSL https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.sh | SIMPLIFY_WITH_GATE=1 bash
```

## 三种使用方式

| 模式 | 适合谁 | 额外增加什么 |
|---|---|---|
| 只用 Skill | 熟悉 Codex、想手动调用的人 | 只有 skill 本体 |
| Skill + `AGENTS.md` gate | Windows 用户、希望规则更稳定的人 | 把 `Simplify Gate` 追加到 `~/.codex/AGENTS.md` |
| Skill + `AGENTS.md` gate + Codex `Stop` hook | macOS / Linux 用户、想多一道原生门槛的人 | 另外把 `Stop` hook 写入 `~/.codex/hooks.json` |

## 平台说明

| 平台 | Skill | `AGENTS.md` gate | Codex `Stop` hook |
|---|---|---|---|
| Windows | 可用 | 推荐作为主路径 | 当前不可用 |
| macOS / Linux | 可用 | 有价值 | 可作为额外门槛 |

按 OpenAI 当前的 Codex hooks 文档，Windows 下 hooks 仍然是禁用状态。所以对 Windows 用户来说，真正可依赖的路径是：**skill + `AGENTS.md` gate**。

## 安装脚本实际会写什么

- plugin：`~/plugins/simplify`
- marketplace：`~/.agents/plugins/marketplace.json`
- 可见 skill 镜像：`~/.codex/skills/using-simplify/SKILL.md`
- 可见 skill 镜像：`~/.codex/skills/simplify/SKILL.md`
- 可选指令层 gate：`~/.codex/AGENTS.md`
- 可选 Codex hook：`~/.codex/hooks.json`

## Hook 配置

Codex 的 hook 发现位置在 `~/.codex/hooks.json` 或 `<repo>/.codex/hooks.json`，不在插件清单里。

这个仓库提供的是：

- [using-simplify](./skills/using-simplify/SKILL.md)：收尾路由 skill
- [SKILL.md](./skills/simplify/SKILL.md)：真正的 `simplify` 元技能
- [AGENTS.snippet.md](./examples/AGENTS.snippet.md)：指令层收尾 gate
- [simplify_stop_gate.py](./scripts/simplify_stop_gate.py)：Codex `Stop` hook 脚本
- [codex.hooks.json](./examples/codex.hooks.json)：Codex hook 配置示例

hook 是增强层，不是核心产品本身。skill 才是主产品。

## 典型使用流程

1. 完成功能实现，并执行本来的验证。
2. 由 `using-simplify` 判断当前是 `Skip`、`Lite`、`Standard` 还是 `Strict`。
3. 如果没有跳过，再针对当前 diff 运行 `simplify`。
4. 运行对应的审查轨道。
5. 输出 `无需清理` 或修正值得修正的问题。
6. 在结束前重新验证。

## Worked Examples

- [Feature / Standard：分层 skill 结构](./examples/cases/feature-standard-closure.md)
- [Bugfix：旧版 PowerShell 安装器兼容](./examples/cases/bugfix-closure.md)
- [Lite / 无需清理：局部收尾](./examples/cases/lite-no-cleanup-needed.md)
- [Strict：hook、安装器与 gate 联动](./examples/cases/strict-closure.md)

## 为什么这个仓库仍然保留插件形态

因为 plugin 解决的是**分发问题**，不是**能力问题**。

如果你已经熟悉 Codex skills 的手工管理方式，可以把这个项目理解成：

- 一组分层的 `simplify` skills
- 外加一个便于公开分发的安装器

## 许可证

[MIT](./LICENSE)
