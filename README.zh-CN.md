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
| 核心产品 | [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) |
| Windows 最优路径 | skill + `AGENTS.md` gate |
| macOS / Linux 最优路径 | skill + `AGENTS.md` gate + 可选 `Stop` hook |
| plugin 的意义 | 降低安装和分发成本 |

## 它做什么

当代码任务进入收尾阶段，`simplify` 会要求主 agent：

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
- 可见 skill 镜像：`~/.codex/skills/simplify/SKILL.md`
- 可选指令层 gate：`~/.codex/AGENTS.md`
- 可选 Codex hook：`~/.codex/hooks.json`

## Hook 配置

Codex 的 hook 发现位置在 `~/.codex/hooks.json` 或 `<repo>/.codex/hooks.json`，不在插件清单里。

这个仓库提供的是：

- [SKILL.md](./skills/simplify/SKILL.md)：真正的 `simplify` 元技能
- [AGENTS.snippet.md](./examples/AGENTS.snippet.md)：指令层收尾 gate
- [simplify_stop_gate.py](./scripts/simplify_stop_gate.py)：Codex `Stop` hook 脚本
- [codex.hooks.json](./examples/codex.hooks.json)：Codex hook 配置示例

hook 是增强层，不是核心产品本身。skill 才是主产品。

## 典型使用流程

1. 完成功能实现，并执行本来的验证。
2. 针对当前 diff 调用 `simplify`。
3. 运行对应的审查轨道。
4. 修正值得修正的问题。
5. 在结束前重新验证。

## 为什么这个仓库仍然保留插件形态

因为 plugin 解决的是**分发问题**，不是**能力问题**。

如果你已经熟悉 Codex skills 的手工管理方式，可以把这个项目理解成：

- 一份核心的 `simplify` skill
- 外加一个便于公开分发的安装器

## 许可证

[MIT](./LICENSE)
