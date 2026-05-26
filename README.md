# Sweet's Borden Lake Association Website

The official website for the Sweet's Borden Lake Association in Garrison, Minnesota.

**Live site:** https://gittster.github.io/sweets-borden-lake/

---

## How the site works

The website is a lightweight, static site hosted on GitHub Pages. There is no database or CMS — all content lives in Google Drive and Google Calendar, which board members already know how to use. The website simply displays that content automatically.

| Page | Where content comes from |
|------|--------------------------|
| Home | Latest file from the News folder |
| News | All files in the News Google Drive folder |
| Events | Embedded Google Calendar |
| Minutes | All files in the Meeting Minutes Google Drive folder |
| History | Embedded Google Doc |
| About | Edited directly in `about.html` |

---

## Setup: Connecting Google (one-time, done by a tech-savvy board member)

Before the website can pull content from Google Drive, you need to fill in `config.js` with real values.

### 1. Create a Google Cloud project and API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with `sweetsbordenlake@gmail.com`.
2. Create a new project (e.g., "Borden Lake Website").
3. Enable the **Google Drive API** under APIs & Services → Library.
4. Go to APIs & Services → Credentials → Create Credentials → **API key**.
5. Copy the key and restrict it to the **Google Drive API** and your GitHub Pages domain for security.

### 2. Find your Google Drive folder and document IDs

For any Google Drive folder or Google Doc, open it in your browser. The ID is in the URL:

- Folder: `https://drive.google.com/drive/folders/`**`THIS_IS_THE_ID`**
- Doc: `https://docs.google.com/document/d/`**`THIS_IS_THE_ID`**`/edit`

You need IDs for:
- The **Meeting Minutes** folder
- The **News** folder  
- The **History** Google Doc

### 3. Make folders publicly viewable

Each Drive folder that the website reads must be shared publicly (view only):

1. Right-click the folder in Google Drive → Share.
2. Click "Change to anyone with the link" → set to **Viewer**.
3. Click Done.

### 4. Find your Google Calendar ID

1. Open [calendar.google.com](https://calendar.google.com) signed in as `sweetsbordenlake@gmail.com`.
2. Click the three dots next to the association calendar → Settings and sharing.
3. Scroll to "Integrate calendar" and copy the **Calendar ID** (looks like an email address).
4. Make the calendar public: under "Access permissions," check "Make available to public."

### 5. Edit config.js

Open `config.js` in the repository and replace the placeholder values:

```javascript
const CONFIG = {
  googleApiKey:    "AIza...",          // your API key
  minutesFolderId: "1aBcD...",         // Meeting Minutes folder ID
  newsFolderId:    "1xYzW...",         // News folder ID
  historyDocId:    "1mNoP...",         // History Google Doc ID
  calendarId:      "sweetsbordenlake@gmail.com"  // or the full calendar ID
};
```

Save and commit the file. The site will start pulling live content within minutes.

---

## Day-to-day content management

### Adding a news post

1. Go to [drive.google.com](https://drive.google.com) and sign in.
2. Open the **News** folder (board members have access).
3. Create a new Google Doc with a descriptive title (e.g., "Spring 2025 Water Quality Update").
4. Write your announcement in the document.
5. The website's News page will automatically show it at the top, sorted by most recently modified.

**Tip:** The document title becomes the headline on the website, so make it clear and descriptive.

### Adding an event

1. Open [calendar.google.com](https://calendar.google.com) and sign in with your board account.
2. Click on the date you want to add an event.
3. Fill in the event title, time, location, and any details.
4. Make sure you're adding it to the **Sweet's Borden Lake** calendar (not your personal calendar).
5. Save. It will appear on the Events page of the website automatically.

### Uploading meeting minutes

1. After a board meeting, save the minutes as a **PDF** or **Google Doc**.
2. Open the **Meeting Minutes** folder in Google Drive.
3. Upload or create the file there. Name it clearly, like: `2025-06-15 Annual Meeting Minutes`.
4. The website's Minutes page will list it automatically at the top.

**Tip:** Include the date at the start of the filename (YYYY-MM-DD format) so files sort chronologically even when filtered by year.

### Updating the history page

1. Open the **History** Google Doc in Google Drive.
2. Edit it just like any other Google Doc.
3. Changes appear on the website's History page automatically (within a few minutes).

---

## Less common tasks

### Updating board member names or roles

The About page is the one piece of content that lives directly in the website code. To update it:

1. Open `about.html` in GitHub (go to the file in the repository, click the pencil icon).
2. Find the `board-list` section — it lists each board member.
3. Edit the names and roles.
4. Commit the changes with a message like "Update board roster."

### Granting a new board member access to Google resources

1. Sign in to Google Drive as `sweetsbordenlake@gmail.com`.
2. Right-click the top-level board folder → Share.
3. Enter the new member's Gmail address and set their role to **Editor**.
4. They'll receive an email invitation.

For Google Calendar access:
1. Open Calendar settings for the association calendar.
2. Under "Share with specific people," add their Gmail address with "Make changes to events" permission.

### Revoking access when someone leaves the board

1. In Google Drive, right-click the shared folder → Share.
2. Find their name and change their role to **Remove access**.
3. Do the same in Google Calendar under "Share with specific people."

### Changing Google IDs (if folders are recreated or docs are moved)

1. Get the new ID from the URL as described in the Setup section.
2. Edit `config.js` in the GitHub repository with the new value.
3. Commit the change.

### Updating the hero photo

1. Add a photo named `lake-hero.jpg` to the `images/` folder in the repository.
2. The home page hero section will automatically use it.

---

## Technical overview (for developers)

- **Hosting:** GitHub Pages (served from the `main` branch root)
- **Stack:** Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies
- **Google Drive:** Uses the Drive API v3 with a read-only API key to list files in public folders
- **Google Calendar:** Standard iframe embed
- **Google Docs:** Published-to-web iframe embed for the History page
- **Config:** All Google resource IDs are in `config.js` at the repo root
- **Responsive:** Mobile-first CSS with a hamburger menu for small screens
- **Print styles:** The Minutes page has a print stylesheet for clean printing

### File structure

```
/
├── index.html       Home page
├── news.html        News & Announcements
├── events.html      Events Calendar
├── minutes.html     Meeting Minutes
├── history.html     Lake History
├── about.html       About & Contact
├── config.js        ← Google IDs and API key (edit this to connect Google)
├── css/
│   └── style.css    All styles
├── js/
│   └── main.js      Google Drive API calls and dynamic content
└── images/
    └── lake-hero.jpg (add your own photo here)
```

### To run locally

Since the site uses the Google Drive API (which requires an API key), you need a local web server rather than just opening the HTML files:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open `http://localhost:8000`.

---

*For technical help, contact whoever set up the website or open an issue in the GitHub repository.*
