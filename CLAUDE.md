# 好习惯省钱账本 · 给接手的 Claude

- 发布的是根目录的单文件 `index.html`（GitHub Pages 和 Claude artifact 都用它）。**不要直接改 `index.html`**：改 `src/` 里对应的部分，然后 `python3 build.py` 生成。
- `src/` 按文件名顺序拼接：`.css` 包进 `<style>`，`.js` 包进 `<script>`，`.html` 原样。主要文件：`13-page.html`（页面结构）、`14-ledger.js`（省钱账本）、`15-workout.js`（运动打卡，含食物库 `FOODS`）、`17-planner.js`（日常计划）、`20-savings.js`、`21-expenses.js`、`22-cycle.js`（生理期）、`23-hub.js`（今天首页、小结、备份、整理习惯）、`24-nav.js`（标签、目录、折叠）。新增 CSS 加在 `10-style7.css` 末尾。
- 每次改动：改 `src/` → `python3 build.py` → `python3 tests/smoke.py`（要全部通过）→ 更新版本号「版本 MM/DD-HHMM」（`src/` 里共 2 处）→ 再 build → 提交并推送 → 发布到 artifact。
- 仓库是公开的：代码、提交说明、测试数据里不能出现任何个人信息（姓名、雇主、地点、金额、身体数据、邮箱）。测试只用编的数据，截图不要放进仓库。
- 模块之间通过 `window.__xxx` 桥接；每个有数据的模块在 `window.__bk.<名字>` 提供 `dump()` / `merge()` 供备份用，新增数据字段时要同步更新。
- Claude artifact 里 `alert/confirm`、`<a download>` 不能用；下载走 `claude.use("downloads")`。db 快照是冻结对象，修改前先深拷贝。
