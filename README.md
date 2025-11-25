# New Chinese Style Digital Menu (新中式电子菜单)

A high-end, responsive digital menu application designed for luxury clubs and hotels. Features a realistic 3D page-turning effect, bilingual support (ZH/EN), and seamless integration with **PocketBase** backend.

专为高端会所和酒店设计的新中式数字菜单。具备逼真的 3D 翻页效果、中英双语支持，并集成了 PocketBase 后端。

![Menu Preview](https://picsum.photos/seed/menu_preview/800/400) *Replace with actual screenshot*

## ✨ Features (功能亮点)

*   **Immersive UI**: "New Chinese" aesthetic with texture backgrounds and 3D book-flip animations.
    *   *沉浸式 UI：新中式美学，纸张纹理背景与 3D 书本翻页动画。*
*   **Mobile First**: Optimized for touch interactions, PWA support (add to home screen).
    *   *移动优先：专为触摸交互优化，支持 PWA（添加到主屏幕）。*
*   **Ordering System**: Shopping cart, quantity adjustment, service charge calculation (PH standard).
    *   *点餐系统：购物车、数量调节、服务费自动计算（菲律宾标准）。*
*   **Service & KTV**: Call for service (water, bill) and KTV song request feature.
    *   *服务与 KTV：呼叫服务（加水、结账）及 KTV 点歌功能。*
*   **Backend Integration**: "Interface-First" design using PocketBase for real-time menu updates.
    *   *后端集成：接口优先设计，使用 PocketBase 实现菜单实时更新。*
*   **Offline Fallback**: Works gracefully with local data if the backend is unreachable.
    *   *离线降级：若后端不可用，自动切换至本地数据，保证应用不白屏。*

## 🛠 Tech Stack (技术栈)

*   **Frontend**: React 18, TypeScript, Tailwind CSS, **Vite**
*   **Backend**: PocketBase (Go-based realtime backend)
*   **Deployment**: Vercel (Frontend) + VPS/CentOS (Backend)

## 📂 Project Structure (项目结构)

```text
├── src/
│   ├── components/      # UI Components (DishCard, Modals, etc.)
│   ├── services/        # API Layer (PocketBase integration)
│   ├── App.tsx          # Main Application Logic
│   ├── constants.ts     # Local Backup Data
│   └── index.css        # Tailwind Global Styles
├── scripts/             # Utility Scripts
│   └── import_data.js   # Script to import data into PocketBase
├── public/              # Static Assets
└── vite.config.ts       # Vite Configuration
```

## 🚀 Quick Start (Frontend) | 前端启动

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/xin-zhong-shi-menu.git
    cd xin-zhong-shi-menu
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory (copied from `.env.example` if available) to point to your backend.
    ```ini
    # .env
    VITE_PB_URL=http://127.0.0.1:8090
    ```
    *(If you don't have a backend yet, you can skip this. The app will use local demo data.)*

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open the URL shown in the terminal (e.g., `http://localhost:5173`).

## 🗄️ Backend Setup (PocketBase) | 后端搭建

1.  **Download PocketBase**
    Download the binary for your OS (Windows/Linux/Mac) from [pocketbase.io](https://pocketbase.io/docs/).

2.  **Start the Server**
    ```bash
    ./pocketbase serve
    ```
    Admin UI will be at `http://127.0.0.1:8090/_/`.

3.  **Create Collections (Database Schema)**
    Create the following collections in the Admin UI:

    *   **categories** (Public View)
    *   **dishes** (Public View)
    *   **orders** (Public Create)
    *   **service_requests** (Public Create)

    *Tip: You can use the `scripts/import_data.js` script to automatically populate the database with the initial menu data.*

4.  **Import Initial Data**
    Edit `scripts/import_data.js` with your Admin credentials, then run:
    ```bash
    node scripts/import_data.js
    ```

## 📦 Deployment | 部署

### Frontend
Deploy to **Vercel**, **Netlify**, or **GitHub Pages**.
Set the Environment Variable `VITE_PB_URL` to your production backend URL (e.g., `https://api.yourmenu.com`).

### Backend
Deploy PocketBase to a VPS (e.g., CentOS).
See [PocketBase Docs](https://pocketbase.io/docs/going-to-production/) for Nginx reverse proxy configuration.

## 📄 License

MIT License
