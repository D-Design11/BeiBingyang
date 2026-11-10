# 验证记录

验证日期：2026-11-10（Asia/Shanghai）。

已完成：

- 与原网站逐文件 SHA-256 对比，复制的原始网站文件内容一致。
- `npm run check`：11 个素材文件的 SHA-256、组件引用、规则范围和草稿状态校验通过；浏览器配置同步成功。
- 新增 Node 与浏览器脚本的 JavaScript 语法检查通过。
- 三份 GitHub 工作流 YAML 语法解析通过。
- 在 Node 沙箱调用原排版引擎：横版、竖版示例可通过布局检查；超长标题被拒绝；SVG 内容转义检查通过。此项使用估算字体，不代表浏览器中的真实字体验收。
- 用户明确允许后，成功启动仅监听 127.0.0.1 的临时服务和独立无界面 Chrome，完成实际品牌字体出图验证：规则版本 0.3.1，measurementMode 为 actual-font；横版 PNG 为 1500 × 1061，竖版 PNG 为 1500 × 2121。已经打开两张实际输出图片进行目视检查，图像、文字、Logo 和识别口号均有输出。
- 使用超长标题执行真实浏览器负向验证：横版与竖版均被容量检查拒绝，命令返回失败状态；保存错误报告，没有生成 PNG。
- 已上传到公开仓库 https://github.com/D-Design11/didi-design-rules ，用户明确同意保留公开并上传品牌素材与字体。首次完整提交为 `b99f5f5d47197a8c75c771b15d7cd6e2d6d1e38a`；远程 46 个文件与本地逐文件 Git blob SHA 核对一致。
- GitHub Actions 的 Check rules 已成功完成：https://github.com/D-Design11/didi-design-rules/actions/runs/42772506816 。
- GitHub Actions 的 Render images 已成功完成：https://github.com/D-Design11/didi-design-rules/actions/runs/42772506797 。运行日志确认规则 0.3.1 使用实际品牌字体生成 2 张 PNG；出图与 upload-artifact 步骤均成功。下载产物名为 `rendered-images`，归档大小 3,323,785 字节，保留 7 天；到期可重新运行。

实际发现的问题：

- 当前横版示例的六字标题“周末一起出发”被分为“五字＋单字”两行。现有规则允许这种换行，因此技术检查通过不等于排版质量合格。原有引擎对 7–12 个连续汉字提供均衡换行，对六字标题没有该处理。本次保留原网站规则，不擅自修改字号或断行算法。上传前若要求该示例达到设计交付质量，仍应调整换行规则并复验。

尚未完成：

- GitHub Pages 网站发布尚未执行；当前仅完成代码托管与 Actions 批量出图运行。
- 完整 PDF 规则复核、完整品牌验收和印前生产验收。

实际字体与 PNG 导出流程已通过本地及 GitHub Actions 验证。当前结果不代表完整品牌验收、完整 PDF 规则 Skill 或已发布 GitHub Pages 网站。
