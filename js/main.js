/* main.js — Sweet's Borden Lake Association */

// ─── Navigation ───────────────────────────────────────────────
(function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Close menu when a link is tapped on mobile
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });

  // Mark active page
  const current = location.pathname.split('/').pop() || 'index.html';
  links.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ─── Google Drive helpers ──────────────────────────────────────
function driveListUrl(folderId) {
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink,webContentLink)');
  const q      = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  return `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime+desc&fields=${fields}&key=${CONFIG.googleApiKey}`;
}

function fileIcon(mimeType) {
  if (mimeType === 'application/pdf')                          return '📄';
  if (mimeType === 'application/vnd.google-apps.document')     return '📝';
  if (mimeType === 'application/vnd.google-apps.spreadsheet')  return '📊';
  if (mimeType === 'application/vnd.google-apps.presentation') return '📊';
  return '📎';
}

function fileLabel(mimeType) {
  if (mimeType === 'application/pdf')                          return 'PDF';
  if (mimeType === 'application/vnd.google-apps.document')     return 'Google Doc';
  if (mimeType === 'application/vnd.google-apps.spreadsheet')  return 'Spreadsheet';
  return 'File';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function isConfigured(id) {
  return id && !id.startsWith('YOUR_');
}

function configWarning(what) {
  return `<div class="state-box error">
    ${what} is not yet configured.
    <span class="config-reminder">Open <code>config.js</code> and fill in the real ID.</span>
  </div>`;
}

async function fetchDriveFiles(folderId) {
  const res  = await fetch(driveListUrl(folderId));
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const data = await res.json();
  return data.files || [];
}

// ─── Home page: news snippet ──────────────────────────────────
async function loadHomeNews() {
  const el = document.getElementById('news-snippet');
  if (!el) return;

  if (!isConfigured(CONFIG.newsFolderId)) {
    el.innerHTML = configWarning('The News folder ID');
    return;
  }
  if (!isConfigured(CONFIG.googleApiKey)) {
    el.innerHTML = configWarning('The Google API key');
    return;
  }

  try {
    const files = await fetchDriveFiles(CONFIG.newsFolderId);
    if (!files.length) {
      el.innerHTML = '<p class="news-loading">No news posts yet.</p>';
      return;
    }
    const latest = files[0];
    el.innerHTML = `
      <p class="news-meta">${formatDate(latest.modifiedTime)}</p>
      <h3 style="margin:6px 0 12px">${escHtml(latest.name)}</h3>
      <p>Click below to read the full post on Google Drive, or visit the News page for all announcements.</p>
      <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
        <a class="read-more" href="${latest.webViewLink}" target="_blank" rel="noopener">Read Latest Post</a>
        <a class="read-more" href="news.html" style="background:var(--green-mid)">All News &rarr;</a>
      </div>`;
  } catch (e) {
    el.innerHTML = `<div class="state-box error">Could not load news: ${escHtml(e.message)}</div>`;
  }
}

// ─── News page ────────────────────────────────────────────────
async function loadNewsList() {
  const el = document.getElementById('news-list');
  if (!el) return;

  if (!isConfigured(CONFIG.newsFolderId)) {
    el.innerHTML = configWarning('The News folder ID'); return;
  }
  if (!isConfigured(CONFIG.googleApiKey)) {
    el.innerHTML = configWarning('The Google API key'); return;
  }

  try {
    const files = await fetchDriveFiles(CONFIG.newsFolderId);
    if (!files.length) {
      el.innerHTML = '<div class="state-box">No news posts found in the folder.</div>';
      return;
    }
    el.innerHTML = '<ul class="news-list">' +
      files.map(f => `
        <li class="news-item">
          <span class="news-file-icon" aria-label="${fileLabel(f.mimeType)}">${fileIcon(f.mimeType)}</span>
          <div class="news-item-content">
            <h3><a href="${f.webViewLink}" target="_blank" rel="noopener">${escHtml(f.name)}</a></h3>
            <p class="news-meta">${formatDate(f.modifiedTime)} &middot; ${fileLabel(f.mimeType)}</p>
          </div>
        </li>`).join('') +
      '</ul>';
  } catch (e) {
    el.innerHTML = `<div class="state-box error">Could not load news: ${escHtml(e.message)}</div>`;
  }
}

// ─── Meeting Minutes page ─────────────────────────────────────
async function loadMinutes() {
  const el        = document.getElementById('minutes-list');
  const yearSel   = document.getElementById('year-filter');
  if (!el) return;

  if (!isConfigured(CONFIG.minutesFolderId)) {
    el.innerHTML = configWarning('The Meeting Minutes folder ID'); return;
  }
  if (!isConfigured(CONFIG.googleApiKey)) {
    el.innerHTML = configWarning('The Google API key'); return;
  }

  let allFiles = [];
  try {
    allFiles = await fetchDriveFiles(CONFIG.minutesFolderId);
  } catch (e) {
    el.innerHTML = `<div class="state-box error">Could not load minutes: ${escHtml(e.message)}</div>`;
    return;
  }

  if (!allFiles.length) {
    el.innerHTML = '<div class="state-box">No meeting minutes found in the folder.</div>';
    return;
  }

  // Populate year filter
  if (yearSel) {
    const years = [...new Set(allFiles
      .filter(f => f.modifiedTime)
      .map(f => new Date(f.modifiedTime).getFullYear()))]
      .sort((a, b) => b - a);

    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    });

    yearSel.addEventListener('change', () => renderMinutes(allFiles, yearSel.value));
  }

  renderMinutes(allFiles, '');

  function renderMinutes(files, year) {
    const filtered = year
      ? files.filter(f => f.modifiedTime && new Date(f.modifiedTime).getFullYear() == year)
      : files;

    if (!filtered.length) {
      el.innerHTML = '<div class="state-box">No minutes for the selected year.</div>';
      return;
    }

    const link = f => f.webViewLink || f.webContentLink || '#';

    el.innerHTML = '<ul class="minutes-list">' +
      filtered.map(f => `
        <li class="minutes-item">
          <span class="minutes-icon" aria-label="${fileLabel(f.mimeType)}">${fileIcon(f.mimeType)}</span>
          <a class="minutes-link" href="${link(f)}" target="_blank" rel="noopener">${escHtml(f.name)}</a>
          <span class="minutes-date">${formatDate(f.modifiedTime)}</span>
        </li>`).join('') +
      '</ul>';
  }
}

// ─── History page ─────────────────────────────────────────────
function loadHistory() {
  const frame   = document.getElementById('history-frame');
  const openBtn = document.getElementById('history-open');
  if (!frame) return;

  if (!isConfigured(CONFIG.historyDocId)) {
    frame.parentElement.innerHTML = configWarning('The History document ID');
    return;
  }

  const embedUrl = `https://docs.google.com/document/d/${CONFIG.historyDocId}/pub?embedded=true`;
  const openUrl  = `https://docs.google.com/document/d/${CONFIG.historyDocId}/view`;

  frame.src = embedUrl;
  if (openBtn) openBtn.href = openUrl;
}

// ─── Events page ──────────────────────────────────────────────
function loadCalendar() {
  const frame = document.getElementById('calendar-frame');
  if (!frame) return;

  if (!isConfigured(CONFIG.calendarId)) {
    frame.parentElement.innerHTML = configWarning('The Google Calendar ID');
    return;
  }

  const src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CONFIG.calendarId)}&ctz=America%2FChicago&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&mode=MONTH`;
  frame.src = src;
}

// ─── Utility ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadHomeNews();
  loadNewsList();
  loadMinutes();
  loadHistory();
  loadCalendar();
});
