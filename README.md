# D-Design 本地规则与 GitHub 运行项目

从现有网站复制的独立版本，包含当前规则、排版引擎、原始品牌素材和网页。可本地运行，也提供 GitHub Actions 出图工作流与 GitHub Pages 部署入口。没有模型 API Key，也不依赖个人 Codex 会话。

## 本地打开网站

需要 Node.js 22 或更新版本；批量出图另需安装 Chrome 或 Chromium。没有 npm 第三方依赖，无需 npm install。

```sh
npm run check
npm start
```

打开 http://127.0.0.1:8765。所有文件需经本地 HTTP 服务读取，不要双击 HTML。

## 本地按规则批量出图

修改 `examples/brief.json` 的标题、副标题、主视觉素材 ID 与尺寸；宽高单位为毫米。

```sh
npm run render -- --input examples/brief.json
```

结果在 `artifacts/`：每个规格一张 PNG，另有 `report.json` 记录规则版本、字体测量方式、布局检查与提示。使用网页原有排版引擎和实际字体。图片宽度沿用网页导出的 1500 像素。任一规格校验失败时，该次任务不输出图片；已有的旧文件不会自动清除，查看前请核对任务报告或使用新的输出目录。

自定义输出目录：`npm run render -- --input examples/brief.json --output artifacts/run-001`。浏览器不在默认安装位置时，通过环境变量 `CHROME_PATH` 指定。当前批量入口支持预置主视觉、标题、副标题、S/M/L/XL 模板、横/竖向品牌识别排列，不支持二维码、自定义上传图和生成式 AI；原网页原有交互另行保留。

## 在 GitHub 上调用运行

将本目录的内容放在仓库根目录，包括 `.github/` 隐藏目录。

- **检查规则**：推送或提交 PR 后自动运行 Check rules。
- **批量出图**：首次上传，以及向 main 推送规则、引擎、素材或示例需求的修改时，自动运行默认示例。也可通过 Actions → Render images → Run workflow 输入需求 JSON 路径手动运行；完成后在该次运行的 Artifacts 下载 `rendered-images`。支持通过 GitHub 的 workflow_dispatch API 触发，需要有仓库权限的凭据；凭据应由后台或调用方保存。
- **网页预览**：仓库 Settings → Pages，将构建来源设为 GitHub Actions；随后手动运行 Deploy preview to Pages。Pages 负责分发网页，排版 JavaScript 在访问者浏览器中执行。Pages 的可用性和访问控制取决于仓库及账户计划，请以仓库设置为准。

GitHub Actions 是按次启动的任务，不是持续运行的图片 API。若网站要让用户提交需求后马上获得结果，需要另外接出图后台，或由后台触发 Actions 并查询任务结果。

## 规则在哪里

| 内容 | 路径 |
|---|---|
| 规则的唯一编辑源 | `public/configs/ginkgo-split.json` |
| 排版计算、保护区与容量检查 | `public/didi-split-layout.js` |
| 素材清单与哈希 | `public/asset-registry.json` |
| 品牌字体、Logo 和主视觉 | `public/assets/` |
| 校验与生成浏览器规则配置 | `scripts/check.mjs` |
| 批量出图调用入口 | `scripts/render.mjs` |
| GitHub 工作流 | `.github/workflows/` |

修改规则 JSON 后执行 `npm run check`，同步生成浏览器使用的 `public/configs/ginkgo-split.js`，不要单独编辑生成的 JS 配置。网页和批量任务使用相同配置与排版引擎。替换素材需同步登记哈希，校验会阻止不一致的素材混入。

## 当前完成范围

这是现有网站规则的可运行副本，规则版本 `0.3.1`、状态 `draft`，不是 PDF 全文规范的完整 Skill。PDF 页码引用是从既有配置保留的追溯信息，本项目没有重新核对 PDF 全文。固定字号、行距和部分比例区间是当前 Demo 试排参数；主/次信息口号与通栏横线仍暂缓。完整品牌验收、印前色彩管理及出血处理未包含。代码仓库不会自动成为模型或 Skill 服务。

原始网站目录保持不变。上传前请确认仓库对品牌素材与字体的可见范围。

## 验证结果

本地实际 Chrome 已成功用品牌字体生成横版与竖版 PNG，超长标题会被阻止出图。横版六字标题存在五字加单字的换行问题，暂时保留原规则并记录在 `VALIDATION.md`。GitHub 工作流只完成语法检查，尚未在远程执行；详细完成范围以 `VALIDATION.md` 为准。
