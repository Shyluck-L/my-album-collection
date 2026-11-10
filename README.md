# My Album Collection

以原生 HTML、CSS 與 JavaScript 製作的靜態專輯收藏網站，可部署至 GitHub Pages。專輯與曲目資料集中在 `albums.js`；使用者提供的收藏心得以 `reviews/` 下的 UTF-8 文字檔管理。

## 本機預覽

專輯清單可直接開啟 `index.html` 預覽。瀏覽器通常不允許 `file://` 頁面讀取心得文字檔；要測試心得，請使用 VS Code Live Server，或在專案根目錄執行：

```powershell
python -m http.server 8000
```

接著瀏覽 `http://localhost:8000`。部署 GitHub Pages 時，網站會以同站相對路徑讀取心得。

## 新增專輯

在 `albums.js` 的 `albums` 陣列新增一筆資料即可自動產生卡片、詳情與曲目 Accordion：

```js
{
  id: "example-album",
  title: "Example Album",
  artist: "Example Artist",
  year: 2024,
  edition: "Example verified edition",
  cover: "assets/covers/example-album.jpg",
  description: "經查證的一句簡短專輯介紹。",
  reviewFile: "",
  tracklistStatus: "complete",
  tracklistSource: {
    label: "已核實的曲目來源",
    url: "https://music.example.com/verified-album"
  },
  tracklistNote: "",
  tracks: [
    {
      number: 1,
      title: "Example Song",
      version: "",
      tag: "",
      links: {
        youtube: "",
        spotify: "",
        lyrics: ""
      }
    }
  ]
}
```

`id` 使用不重複的小寫英文、數字及連字號；`cover` 使用與實際圖片相符的相對路徑。指定 `edition` 並確認曲目順序與完整性後，才可將 `tracklistStatus` 設為 `"complete"`。沒有確認完整時，使用其他狀態，頁面會顯示「曲目資料整理中」。特殊曲目 `tag` 僅填官方標示；未確認的直達連結填空字串。空白的 YouTube、Spotify、Lyrics 連結會以標示清楚的搜尋連結代替，不會冒稱官方歌曲頁。

## 收藏心得

只將使用者親自提供的心得存入 `reviews/{album.id}-review.txt`，並在專輯資料中填入相對路徑，例如：

```js
reviewFile: "reviews/example-album-review.txt"
```

使用 UTF-8 純文字，保留原始段落與換行；不需建立 HTML，也不要為沒有心得的專輯建立空白檔案。`reviewFile` 為空、檔案不存在、空白或讀取失敗時，網站顯示「暫無心得」。
