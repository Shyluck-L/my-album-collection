# My Album Collection

一個用來分享個人喜歡的音樂專輯、歌曲及收藏心得的靜態網站。

## 網站連結

`https://shyluck-l.github.io/my-album-collection/`

## 主要功能

- **專輯收藏展示**：顯示專輯封面、歌手、發行年份及簡短介紹。
- **Tracklist**：依指定發行版本列出專輯收錄曲目。
- **特殊曲目標籤**：標示 `ALBUM ONLY`、`BONUS TRACK` 等特殊收錄資訊。
- **歌曲資訊展開**：點擊歌曲，在該曲目下方展開或收合詳細資訊。
- **外部連結**：提供可用的 YouTube、Spotify 及歌詞網站連結。
- **個人收藏心得**：透過 `reviews/` 資料夾管理及顯示心得；未提供時顯示「暫無心得」。
- **響應式設計**：支援電腦及手機瀏覽。

## 使用技術

- HTML
- CSS
- Vanilla JavaScript
- GitHub Pages

## 專案結構

```text
my-album-collection/
├── AGENTS.md          # AI 開發與維護規則
├── README.md          # 專案說明
├── index.html         # 網站首頁與內容區塊
├── style.css          # 網站樣式
├── script.js          # 網站互動與資料顯示
├── albums.js          # 專輯及曲目資料
├── assets/
│   └── covers/        # 專輯封面圖片
└── reviews/           # 個人收藏心得文字檔
```

## AGENTS.md 與專案擴充

本專案透過 `AGENTS.md` 定義網站風格、檔案命名、專輯資料格式、曲目資訊查證原則及 AI 修改規範。

新增專輯時，AI Agent 可先閱讀 `AGENTS.md`，再依照規則將專輯資訊與 Tracklist 加入 `albums.js`。網站便能沿用既有設計顯示新的專輯卡片及詳情，不必重新編寫頁面結構。

收藏心得則由 Agent 依使用者提供的文字建立對應的 `reviews/{album-id}-review.txt` 檔案，避免自行編造個人經驗。本次也以 Billie Eilish 的《HIT ME HARD AND SOFT》進行新增專輯測試，展示這套規則的可重複使用性。
