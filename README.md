# 学情可视化 × 知识星球（整合工作仓库）

本仓库用于在不改动两个原始仓库的前提下完成整合开发。

## 来源与结构

- 学情可视化：基于 `zmdyy/-`
- 知识星球：基于 `zmdyy/zsxq1`
- `/index.html`：学情可视化主页面
- `/knowledge/index.html`：物理知识宇宙
- `/data/knowledge/knowledge-db.js`：两端共用的知识点目录
- `/data/question-knowledge-map.schema.json`：P0 映射数据约束

原始两个仓库保持不动，整合功能只在本仓库迭代。

## P0：统一 concept_id

知识星球原有节点的 `id` 直接作为统一的 `concept_id`。不再建立第二套知识点编号。

题目映射 V1 **严格只保存三个字段**：

```json
{
  "exam_id": "b...",
  "question_no": "物理/12",
  "concept_id": "mech_pressure"
}
```

其中：
- `exam_id`：考试批次 ID；
- `question_no`：题号。当前使用“科目/题号”避免跨科同号冲突；
- `concept_id`：知识星球节点 ID。

映射随考试批次一起保存在原系统使用的 IndexedDB 中，不另建 AI 识别层，也不在 P0 保存关联知识点或误概念判断。

## 当前已打通的链路

在 **学情可视化 → 小题分析 → 小题统计** 中：

1. 保存考试批次；
2. 对某道题点击“标注”；
3. 选择一个主知识点；
4. 保存后，题目显示对应知识点；
5. 点击知识点名称，直接打开 `/knowledge/index.html?concept_id=...`；
6. 知识星球自动定位并打开该知识节点。

因此当前 P0 数据链为：

**考试数据 → 小题异常 → 主知识点 concept_id → 知识星球对应节点**

## P0 暂不做

- AI 自动识别题目知识点；
- 完整误概念库；
- 单题错误直接推断学生误概念；
- 复杂的多知识点权重。

这些内容留到 P1/P2，在 P0 链路稳定后再增加。

## 知识图谱关系体检

2026-09-27 已完成一次全图谱关系合理性体检，重点把“教材顺序链”改造成真实的知识依赖、汇聚、分支和并列结构。

- 体检说明：`docs/知识图谱关系体检-2026-09-27.md`
- 自动一致性检查：`node tools/audit-knowledge-graph.js`
- 当前检查目标：无重复节点对、无悬空内部关系、无孤立知识点，且 `prerequisites` 与运行时 prerequisite 完全一致。

## 自动布局与视觉体检

知识星球现已使用 `knowledge/layout-engine.js` 自动生成“模块 → 章节 → 知识点”的语义布局，并做局部拓扑松弛，不再直接沿用原始教材顺序坐标。

视觉层同时加入：

- 模块空间分区，避免力学、光学、热学等大面积叠在一起；
- 高连接节点自动获得更大安全间距；
- 标签碰撞规避；
- 选中知识点后只显示当前节点和直接关联节点；
- 总览关系线按关系类型自动降噪，进入模块/聚焦后再增强。

自动检查：

```bash
node tools/audit-knowledge-graph.js
node tools/audit-visual-layout.js
```

其中视觉体检会检查无效坐标、模块内最小节点间距、模块间分离度、标签碰撞规避是否启用，以及旧的“选中后全部标签显示”问题是否回归。



## MinerU 解析

正式使用采用 **GitHub Pages 前端 + 公网 HTTPS MinerU 代理**：

- 前端：GitHub Pages（静态 HTML/JS）
- 后端：Render Web Service（Flask + Gunicorn）
- 健康检查：`/health`
- MinerU 轻量代理：`/mineru/parse-file`
- MinerU 精准代理：`/mineru/parse-file-precise`

浏览器不再直接跨域访问 `mineru.net`，也不要求教师本机启动 Python 服务。

### Render 一次性部署

仓库根目录提供 `render.yaml`。在 Render 中用本仓库创建 Blueprint / Web Service 后，会自动使用：

- Build：`pip install -r requirements-mineru.txt`
- Start：`gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 600 mineru_server:app`
- Health Check：`/health`
- `MINERU_SERVE_APP=0`：云端只提供 API，不重复托管前端。

默认服务名为：

`xqksh-zxxq-mineru-zmdyy`

因此 GitHub Pages 默认代理地址为：

`https://xqksh-zxxq-mineru-zmdyy.onrender.com`

如果实际 Render 服务地址不同，可在浏览器控制台执行：

```js
localStorage.setItem('mineruApiBase', 'https://你的服务.onrender.com');
location.reload();
```

### Token

精准模式仍由用户在页面填写 MinerU Token。Token 会随本次上传请求发送到代理，再由代理以 Bearer 鉴权调用 MinerU V4；代理代码不把 Token 写入服务器文件或日志。

### 本地调试

`start_local.bat` 仅作为开发和故障排查工具保留。它会启动：

`http://127.0.0.1:5500/index.html`

正常教师使用不需要双击 BAT，也不需要安装 Python。

### 解析模式

- **MinerU 轻量解析**：免 Token。
- **MinerU 精准解析**：填写 MinerU Token，代理调用官方 V4 `file-urls/batch → extract-results/batch/{batch_id}`，下载完整结果 ZIP，并把 ZIP 内图片内嵌到 Markdown。
- 选择精准模式后不会自动降级为轻量或 pdf.js；失败时会显示代理或 MinerU 返回的真实错误。

### Render 免费实例说明

免费 Web Service 闲置后会休眠，首次请求可能需要较长时间唤醒。前端针对公网代理使用更长的健康检查等待时间，避免把冷启动误判成服务故障。
