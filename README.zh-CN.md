# Codex Simplify

[![Skill-first](https://img.shields.io/badge/shape-skill--first-111111?style=flat-square)](./skills/simplify/SKILL.md)
[![AGENTS gate](https://img.shields.io/badge/gate-AGENTS.md-0A7A3F?style=flat-square)](./examples/AGENTS.snippet.md)

[English README](./README.md)

> 面向 Codex 收尾阶段的 skill-first 清理协议。<br>
> 在宣称代码任务完成之前，先经过 `using-simplify` 与 `simplify`。

`Codex Simplify` 是一组用于任务收尾的小型 skill 套件。现在既可以作为全局 npm CLI 安装，也保留了仓库里的原始 skill 与 `AGENTS.md` gate 片段。

## 一眼看懂

| 项目 | 路径 |
|---|---|
| 入口 skill | [`skills/using-simplify/SKILL.md`](./skills/using-simplify/SKILL.md) |
| 清理协议 | [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) |
| Gate 片段 | [`examples/AGENTS.snippet.md`](./examples/AGENTS.snippet.md) |
| 协议历史 | [`CHANGELOG.md`](./CHANGELOG.md) |
| 审查模式 | Lite / Standard / Strict |
| 推荐安装方式 | `npm i -g codex-simplify` 后执行 `codex-simplify install` |

## 版本与升级

当前协议版本：`0.2.1`

版本信息放在 skill 正文和 [CHANGELOG.md](./CHANGELOG.md) 里，不写进 frontmatter。原因是当前 Codex skill frontmatter 兼容格式只保留 `name` 和 `description`。

升级规则：

- [`skills/using-simplify/SKILL.md`](./skills/using-simplify/SKILL.md) 与 [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) 必须一起替换
- 只要协议版本变化，就同步刷新 [`examples/AGENTS.snippet.md`](./examples/AGENTS.snippet.md) 的已安装副本
- 不要混用不同版本的 router 和 executor

Breaking change 规则：

- 当 mode 判断顺序、router 向 executor 传递的字段、任务分类、finding contract 语义、收尾报告必填项发生会改变 agent 行为的变化时，升级 major 版本
- 只增加澄清说明或补充客观触发信号、但不改变核心协议时，升级 minor 版本
- 只修正文案或仓库包装方式、不改变预期执行行为时，升级 patch 版本

## 仓库内容

这个仓库提供：

- [using-simplify](./skills/using-simplify/SKILL.md)：收尾路由 skill
- [simplify](./skills/simplify/SKILL.md)：清理协议执行 skill
- [AGENTS.snippet.md](./examples/AGENTS.snippet.md)：可选的指令层 gate
- [CHANGELOG.md](./CHANGELOG.md)：协议历史

## 安装

全局 npm 安装：

```bash
npm i -g codex-simplify
codex-simplify install
```

可选参数：

```bash
codex-simplify install --no-gate
codex-simplify install --target ~/.codex
codex-simplify install --agents ~/.codex/AGENTS.md
```

默认安装行为是：把两份 skill 复制到 `~/.codex/skills`，并且只在目标文件还没有 `## Simplify Gate` 这段内容时，追加到 `~/.codex/AGENTS.md`。

## 手工安装

从本地克隆后的仓库目录执行：

Windows PowerShell：

```powershell
New-Item -ItemType Directory -Force "$HOME\.codex\skills" | Out-Null
Copy-Item -Recurse -Force .\skills\using-simplify "$HOME\.codex\skills\"
Copy-Item -Recurse -Force .\skills\simplify "$HOME\.codex\skills\"
New-Item -ItemType File -Force "$HOME\.codex\AGENTS.md" | Out-Null
Get-Content .\examples\AGENTS.snippet.md | Add-Content "$HOME\.codex\AGENTS.md"
```

macOS / Linux：

```bash
mkdir -p ~/.codex/skills
cp -R skills/using-simplify ~/.codex/skills/
cp -R skills/simplify ~/.codex/skills/
touch ~/.codex/AGENTS.md
cat examples/AGENTS.snippet.md >> ~/.codex/AGENTS.md
```

如果你更希望规则只在某个项目里生效，可以把片段追加到仓库内的 `AGENTS.md`，不写入全局目录。

## 工作方式

当代码任务进入收尾阶段：

1. `using-simplify` 先判断当前属于 `Skip`、`Lite`、`Standard` 还是 `Strict`。
2. `simplify` 再按该模式审查当前任务范围。
3. findings 会被收敛到 `must_fix`、`fix_if_cheap`、`note_only`。
4. 受影响路径重新验证后，才能宣称完成。

`Skip` 和 `无需清理` 不是一回事：

- `Skip`：没有值得进入 simplify 的目标
- `无需清理`：已经运行了 simplify，但没有发现值得处理的问题

## 审查模式

| 模式 | 适用场景 | 结果 |
|---|---|---|
| `Skip` | 纯文档、纯注释、纯格式化、无关元数据，或没有行为性改动 | 明确写出跳过依据 |
| `Lite` | 1 到 2 个局部低风险文件，且没有共享模块、配置、manifest 或验证范围变化 | 短审查 + 最小必要验证 |
| `Standard` | 正常 feature / bugfix / refactor 收尾 | 执行标准清理协议 |
| `Strict` | 高风险或大范围改动 | 提高审查强度与验证范围 |

`Strict` 的客观触发信号包括：

- 改动 6 个及以上文件
- 改动构建或运行配置
- 改动依赖清单
- 改动共享或公共模块
- 改动测试并扩大验证范围
- 改动 agent 行为配置或 manifest 文件
- 跨多个调用面改变用户可见行为

## 典型流程

1. 完成功能实现，并执行正常验证。
2. 由 `using-simplify` 判断模式。
3. 由 `simplify` 审查当前任务范围。
4. 修正值得修正的问题。
5. 重新验证后再结束任务。

## 许可证

[MIT](./LICENSE)
