const albumGrid = document.getElementById("album-grid");
const collectionSection = document.querySelector(".collection-section");
const detailSection = document.getElementById("album-detail");
const loadMessage = document.getElementById("load-message");
const previousFocus = { button: null };
let activeTrack = null;
let reviewRequestId = 0;

const externalPlatforms = [
  {
    key: "youtube",
    label: "YouTube",
    searchLabel: "在 YouTube 搜尋",
    searchUrl: (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  },
  {
    key: "spotify",
    label: "Spotify",
    searchLabel: "在 Spotify 搜尋",
    searchUrl: (query) => `https://open.spotify.com/search/${encodeURIComponent(query)}`
  },
  {
    key: "lyrics",
    label: "Lyrics",
    searchLabel: "搜尋歌詞",
    searchUrl: (query) => `https://www.google.com/search?q=${encodeURIComponent(`${query} lyrics`)}`
  }
];

function setImageFallback(image, fallback) {
  image.onerror = () => {
    image.hidden = true;
    fallback.hidden = false;
  };
}

function createAlbumCard(album) {
  const article = document.createElement("article");
  article.className = "album-card";

  const coverWrap = document.createElement("div");
  coverWrap.className = "cover-wrap";

  const image = document.createElement("img");
  image.className = "cover-image";
  image.alt = `${album.title} 專輯封面`;
  image.loading = "lazy";

  const fallback = document.createElement("div");
  fallback.className = "cover-fallback";
  fallback.hidden = true;
  fallback.setAttribute("aria-hidden", "true");

  const fallbackNote = document.createElement("span");
  fallbackNote.textContent = "♫";
  const fallbackText = document.createElement("span");
  fallbackText.textContent = "封面暫時無法顯示";
  fallback.append(fallbackNote, fallbackText);
  setImageFallback(image, fallback);
  image.src = album.cover;
  coverWrap.append(image, fallback);

  const copy = document.createElement("div");
  copy.className = "card-copy";

  const artist = document.createElement("p");
  artist.className = "card-artist";
  artist.textContent = album.artist;

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = album.title;

  const description = document.createElement("p");
  description.className = "card-description";
  description.textContent = album.description;

  const button = document.createElement("button");
  button.className = "detail-button";
  button.type = "button";
  button.textContent = "查看詳情";
  button.setAttribute("aria-label", `查看 ${album.title} 詳情`);
  button.addEventListener("click", () => showAlbumDetail(album, button));

  copy.append(artist, title, description, button);
  article.append(coverWrap, copy);
  return article;
}

function showAlbumDetail(album, trigger) {
  previousFocus.button = trigger;

  const image = document.getElementById("detail-cover");
  const fallback = document.getElementById("detail-cover-fallback");
  image.hidden = false;
  fallback.hidden = true;
  image.alt = `${album.title} 專輯封面`;
  setImageFallback(image, fallback);
  image.src = album.cover;

  document.getElementById("detail-title").textContent = album.title;
  document.getElementById("detail-artist").textContent = album.artist;
  document.getElementById("detail-year").textContent = album.year
    ? `發行年份｜${album.year}`
    : "發行年份｜待確認";
  document.getElementById("detail-description").textContent = album.description;
  document.getElementById("detail-edition").textContent = album.edition
    ? `曲目版本｜${album.edition}`
    : "曲目版本｜待確認";

  loadReview(album);
  renderTracklist(album);

  collectionSection.hidden = true;
  detailSection.hidden = false;
  detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("back-button").focus({ preventScroll: true });
}

function setReviewPlaceholder() {
  const review = document.getElementById("detail-notes");
  review.textContent = "暫無心得";
  review.classList.add("is-empty");
}

async function loadReview(album) {
  const requestId = ++reviewRequestId;
  setReviewPlaceholder();

  if (!album.reviewFile) {
    return;
  }

  try {
    const response = await fetch(album.reviewFile);
    if (!response.ok) {
      throw new Error(`Review request failed with status ${response.status}`);
    }

    const text = await response.text();
    if (requestId !== reviewRequestId) {
      return;
    }

    if (text.trim()) {
      const review = document.getElementById("detail-notes");
      review.textContent = text;
      review.classList.remove("is-empty");
    }
  } catch {
    if (requestId === reviewRequestId) {
      setReviewPlaceholder();
    }
  }
}

function isAllowedExternalUrl(value, platform) {
  if (typeof value !== "string" || !value) {
    return false;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return false;
    }
    if (platform === "lyrics") {
      return true;
    }
    const allowedHosts = platform === "youtube"
      ? ["youtube.com", "youtu.be"]
      : ["spotify.com"];
    return allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function createExternalLinks(album, track) {
  const links = document.createElement("div");
  links.className = "song-links";

  const query = [album.artist, track.title, track.version].filter(Boolean).join(" ");

  externalPlatforms.forEach((platform) => {
    const directUrl = track.links?.[platform.key];
    const hasDirectLink = isAllowedExternalUrl(directUrl, platform.key);
    const anchor = document.createElement("a");
    anchor.className = "song-link";
    anchor.href = hasDirectLink ? directUrl : platform.searchUrl(query);
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = hasDirectLink ? platform.label : platform.searchLabel;
    links.append(anchor);
  });

  return links;
}

function createSongPanel(album, track, button, panelId) {
  const panel = document.createElement("div");
  panel.className = "track-panel";
  panel.id = panelId;
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-labelledby", button.id);
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;

  const content = document.createElement("div");
  content.className = "track-panel-content";

  const title = document.createElement("h4");
  title.className = "song-detail-title";
  title.textContent = `${track.number}. ${track.title}`;

  const number = document.createElement("p");
  number.textContent = `曲目編號｜${track.number}`;

  const version = document.createElement("p");
  version.textContent = `版本補充｜${track.version || "無"}`;

  const tag = document.createElement("p");
  tag.textContent = `特殊標籤｜${track.tag || "無"}`;

  content.append(title, number, version, tag, createExternalLinks(album, track));
  panel.append(content);
  return panel;
}

function setTrackExpanded(trackState, expanded) {
  trackState.button.setAttribute("aria-expanded", String(expanded));
  trackState.panel.setAttribute("aria-hidden", String(!expanded));
  trackState.panel.inert = !expanded;
  trackState.panel.classList.toggle("is-open", expanded);
  trackState.indicator.textContent = expanded ? "⌃" : "⌄";
}

function toggleTrack(trackState) {
  if (activeTrack === trackState) {
    setTrackExpanded(trackState, false);
    activeTrack = null;
    return;
  }

  if (activeTrack) {
    setTrackExpanded(activeTrack, false);
  }

  setTrackExpanded(trackState, true);
  activeTrack = trackState;
}

function renderTracklist(album) {
  const list = document.getElementById("tracklist");
  const status = document.getElementById("tracklist-status");
  const sourceWrap = document.getElementById("tracklist-source-wrap");
  const noteSourceWrap = document.getElementById("tracklist-note-source-wrap");
  const note = document.getElementById("tracklist-note");

  list.replaceChildren();
  activeTrack = null;
  document.getElementById("track-count").textContent = "";
  sourceWrap.hidden = true;
  noteSourceWrap.hidden = true;
  note.hidden = true;
  status.hidden = false;

  if (album.tracklistStatus !== "complete" || !Array.isArray(album.tracks) || album.tracks.length === 0) {
    status.textContent = "曲目資料整理中，尚未確認完整曲目表。";
    return;
  }

  album.tracks.forEach((track) => {
    const item = document.createElement("li");
    item.className = "track-item";

    const button = document.createElement("button");
    button.className = "track-button";
    button.type = "button";
    button.id = `track-toggle-${album.id}-${track.number}`;
    button.setAttribute("aria-expanded", "false");

    const panelId = `track-panel-${album.id}-${track.number}`;
    button.setAttribute("aria-controls", panelId);

    const number = document.createElement("span");
    number.className = "track-number";
    number.textContent = String(track.number).padStart(2, "0");

    const title = document.createElement("span");
    title.className = "track-title";
    title.textContent = track.title;
    button.append(number, title);

    if (track.tag) {
      const tag = document.createElement("span");
      tag.className = "track-tag";
      tag.textContent = track.tag;
      button.append(tag);
    }

    const indicator = document.createElement("span");
    indicator.className = "track-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = "⌄";
    button.append(indicator);

    const panel = createSongPanel(album, track, button, panelId);
    const trackState = { button, panel, indicator };
    button.addEventListener("click", () => toggleTrack(trackState));

    item.append(button, panel);
    list.append(item);
  });

  status.hidden = true;
  document.getElementById("track-count").textContent = `${album.tracks.length} 首`;

  if (album.tracklistNote) {
    note.textContent = album.tracklistNote;
    note.hidden = false;
  }

  if (album.tracklistSource) {
    const sourceLink = document.getElementById("tracklist-source");
    sourceLink.href = album.tracklistSource.url;
    sourceLink.textContent = album.tracklistSource.label;
    sourceWrap.hidden = false;
  }

  if (album.tracklistNoteSource) {
    const noteSourceLink = document.getElementById("tracklist-note-source");
    noteSourceLink.href = album.tracklistNoteSource.url;
    noteSourceLink.textContent = album.tracklistNoteSource.label;
    noteSourceWrap.hidden = false;
  }
}

function closeAlbumDetail() {
  reviewRequestId += 1;
  detailSection.hidden = true;
  collectionSection.hidden = false;
  collectionSection.scrollIntoView({ behavior: "smooth", block: "start" });
  if (previousFocus.button) {
    previousFocus.button.focus({ preventScroll: true });
  }
}

if (typeof albums === "undefined" || !Array.isArray(albums)) {
  loadMessage.textContent = "專輯資料無法載入，請確認 albums.js 是否正確。";
  loadMessage.hidden = false;
} else if (albums.length === 0) {
  loadMessage.textContent = "目前還沒有專輯收藏。";
  loadMessage.hidden = false;
} else {
  const cards = document.createDocumentFragment();
  albums.forEach((album) => cards.append(createAlbumCard(album)));
  albumGrid.append(cards);
  document.getElementById("album-count").textContent = `共 ${albums.length} 張專輯`;
}

document.getElementById("back-button").addEventListener("click", closeAlbumDetail);
