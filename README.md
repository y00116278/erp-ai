# ERP 系统 (Enterprise Resource Planning)

基于 Next.js + React + Zustand + Tailwind CSS 构建的企业资源管理系统。

## 功能特性

- **仪表盘 (Dashboard)**: 业务数据概览，统计卡片，快速操作
- **产品管理 (Products)**: 产品列表、搜索、筛选、增删改查
- **订单管理 (Orders)**: 订单列表、状态管理、创建订单、查看详情
- **客户管理 (Customers)**: 客户列表、搜索、增删改查、消费统计
- **库存管理 (Inventory)**: 库存概览、低库存警报、库存调整、历史记录
- **AI 助手**: 右下角浮动按钮，支持自然语言查询 ERP 数据
- **多语言支持**: 英文、简体中文、繁体中文

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **状态管理**: Zustand
- **图标**: Lucide React
- **ID生成**: UUID

## 项目结构

```
erp/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页 / Dashboard
│   │   ├── products/           # 产品管理页面
│   │   ├── orders/             # 订单管理页面
│   │   ├── customers/          # 客户管理页面
│   │   ├── inventory/         # 库存管理页面
│   │   ├── layout.tsx          # 根布局
│   │   └── globals.css         # 全局样式
│   │
│   ├── components/             # React 组件
│   │   ├── Sidebar.tsx         # 侧边栏导航
│   │   ├── Header.tsx          # 顶部导航栏
│   │   ├── AppLayout.tsx       # 应用布局容器
│   │   ├── Modal.tsx           # 通用弹窗组件
│   │   ├── Notification.tsx    # 通知提示组件
│   │   ├── AIAssistant.tsx     # AI 助手组件
│   │   └── LanguageSwitcher.tsx # 语言切换组件
│   │
│   ├── store/                  # Zustand 状态管理
│   │   ├── productStore.ts     # 产品数据
│   │   ├── orderStore.ts      # 订单数据
│   │   ├── customerStore.ts   # 客户数据
│   │   ├── inventoryStore.ts # 库存数据
│   │   ├── uiStore.ts         # UI 状态
│   │   └── languageStore.ts  # 语言设置
│   │
│   └── types/                  # TypeScript 类型定义
│       └── index.ts
│
├── package.json                # 项目依赖配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── postcss.config.js          # PostCSS 配置
└── next.config.js             # Next.js 配置
```

## 环境要求

- Node.js 18+
- npm 9+

## 安装依赖

```bash
npm install
```

## 开发模式运行

```bash
npm run dev
```

访问 http://localhost:3000 (或 http://localhost:3001, 3002 等端口)

## 生产环境构建

```bash
npm run build
```

构建完成后，使用以下命令启动生产服务器：

```bash
npm start
```

## 主要页面

| 路径 | 描述 |
|------|------|
| `/` | 仪表盘 - 数据概览 |
| `/products` | 产品管理 |
| `/orders` | 订单管理 |
| `/customers` | 客户管理 |
| `/inventory` | 库存管理 |

## 状态管理说明

系统使用 Zustand 进行状态管理，各 Store 职责：

- **productStore**: 产品数据的 CRUD 操作
- **orderStore**: 订单数据的 CRUD 操作
- **customerStore**: 客户数据的 CRUD 操作
- **inventoryStore**: 库存变动记录
- **uiStore**: 侧边栏折叠状态、弹窗管理、通知提示
- **languageStore**: 当前语言设置（持久化到 localStorage）

## AI 助手功能

AI 助手支持以下自然语言查询：

- "show products" / "产品有哪些"
- "show orders" / "订单有哪些"
- "show customers" / "客户有哪些"
- "revenue report" / "营收报告"
- "dashboard summary" / "仪表盘摘要"
- "low stock products" / "低库存产品"
- "top selling products" / "畅销产品"
- "help" / "帮助"

## 多语言切换

界面右上角有语言切换按钮，支持：
- English (英文)
- 简体中文
- 繁體中文

语言设置保存在浏览器 localStorage 中，刷新后保持。

## 数据说明

系统使用内存存储数据，刷新页面后会重置为初始数据。如需持久化，可将 Zustand Store 改为持久化存储或接入后端数据库。

## 许可证

MIT
