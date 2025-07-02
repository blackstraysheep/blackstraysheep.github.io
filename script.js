document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      navList.classList.toggle('show');
    });
  }

  // ブログページの場合、記事を自動検出してサイドバーに追加
  if (window.location.pathname.includes('/blog/') || window.location.pathname.includes('\\blog\\')) {
    console.log('ブログページを検出しました。記事の自動検出を開始します。');
    autoDetectBlogPosts();
  } else {
    console.log('現在のパス:', window.location.pathname);
  }
});

// ブログ記事を自動検出してサイドバーに追加する関数
async function autoDetectBlogPosts() {
  console.log('autoDetectBlogPosts 関数が実行されました');
  
  const sidebarList = document.querySelector('.sidebar-list');
  if (!sidebarList) {
    console.error('sidebar-list 要素が見つかりません');
    return;
  }

  console.log('sidebar-list 要素を発見しました');

  try {
    const posts = [];
    const maxPosts = 20;

    console.log(`post1.html から post${maxPosts}.html まで検索を開始します`);

    for (let i = 1; i <= maxPosts; i++) {
      const filename = `post${i}.html`;
      try {
        console.log(`${filename} を検索中...`);
        const response = await fetch(filename);
        if (response.ok) {
          console.log(`${filename} が見つかりました`);
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const title = doc.querySelector('#post-content h1')?.textContent.trim();
          const dateEl = doc.querySelector('.post-date');
          const date = dateEl?.textContent.trim();
          
          console.log(`${filename} - タイトル: "${title}", 日付: "${date}"`);
          
          if (title && date) {
            posts.push({
              filename: filename,
              title: title,
              date: date,
              dateObj: new Date(date)
            });
            console.log(`${filename} を記事リストに追加しました`);
          } else {
            console.warn(`${filename} にタイトルまたは日付が見つかりません`);
          }
        } else {
          console.log(`${filename} は存在しません (${response.status})`);
        }
      } catch (error) {
        // ファイルが存在しない場合は無視
        console.log(`${filename} の取得に失敗: ${error.message}`);
        continue;
      }
    }

    console.log(`検出された記事数: ${posts.length}`);

    if (posts.length === 0) {
      console.warn('記事が見つかりませんでした。手動でリンクを追加します。');
      // フォールバック: 手動でリンクを追加
      const fallbackPosts = [
        { filename: 'post1.html', title: 'Excel/Google Spreadsheetでの縦書き', date: '2025-06-26' },
        { filename: 'post2.html', title: '開発備忘録: GitHubトークン取得からElectronビルド、Gitの空コミットまで', date: '2025-07-03' }
      ];
      
      fallbackPosts.forEach(post => {
        posts.push({
          ...post,
          dateObj: new Date(post.date)
        });
      });
    }

    // 日付順でソート（新しい順）
    posts.sort((a, b) => b.dateObj - a.dateObj);

    // 既存のリンクをクリア
    sidebarList.innerHTML = '';

    // 新しいリンクを追加
    posts.forEach(post => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = post.filename;
      link.className = 'post-link';
      link.target = 'post-frame';
      link.textContent = `${post.date} – ${post.title}`;
      li.appendChild(link);
      sidebarList.appendChild(li);
      console.log(`サイドバーに追加: ${post.date} – ${post.title}`);
    });

    console.log(`自動検出により${posts.length}件の記事をサイドバーに追加しました`);

    // 最新の記事を iframe に表示
    if (posts.length > 0) {
      const iframe = document.getElementById('post-frame');
      if (iframe) {
        iframe.src = posts[0].filename;
        console.log(`iframeに最新記事を表示: ${posts[0].filename}`);
      }
    }

  } catch (error) {
    console.error('ブログ記事の自動検出に失敗しました:', error);
    
    // エラー時のフォールバック
    const sidebarList = document.querySelector('.sidebar-list');
    if (sidebarList) {
      sidebarList.innerHTML = `
        <li><a href="post2.html" class="post-link" target="post-frame">2025-07-03 – 開発備忘録</a></li>
        <li><a href="post1.html" class="post-link" target="post-frame">2025-06-26 – Excel/Google Spreadsheetでの縦書き</a></li>
      `;
      console.log('フォールバックリンクを追加しました');
    }
  }
}

// サイドバーリンクの手動更新（後方互換性のため残す）
document.querySelectorAll('.sidebar-list .post-link').forEach(link => {
  fetch(link.href)
    .then(res => res.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const title = doc.querySelector('#post-content h1')?.textContent.trim();
      const date  = doc.querySelector('.post-date')?.textContent.trim();
      link.textContent = date && title
        ? `${date} – ${title}`
        : link.href;
    })
    .catch(_ => {
      // 取得失敗時はURLをそのまま
      link.textContent = link.href;
    });
});