document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  toggle.addEventListener('click', () => {
    navList.classList.toggle('show');
  });

  // ブログページの場合、記事を自動検出してサイドバーに追加
  if (window.location.pathname.includes('/blog/')) {
    autoDetectBlogPosts();
  }
});

// ブログ記事を自動検出してサイドバーに追加する関数
async function autoDetectBlogPosts() {
  const sidebarList = document.querySelector('.sidebar-list');
  if (!sidebarList) return;

  try {
    // より多くのポストパターンを検索（post1.html から post20.html まで）
    const posts = [];
    const maxPosts = 20;

    for (let i = 1; i <= maxPosts; i++) {
      const filename = `post${i}.html`;
      try {
        const response = await fetch(filename);
        if (response.ok) {
          const html = await response.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const title = doc.querySelector('#post-content h1')?.textContent.trim();
          const dateEl = doc.querySelector('.post-date');
          const date = dateEl?.textContent.trim();
          
          if (title && date) {
            posts.push({
              filename: filename,
              title: title,
              date: date,
              dateObj: new Date(date)
            });
          }
        }
      } catch (error) {
        // ファイルが存在しない場合は無視
        continue;
      }
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
    });

    console.log(`自動検出により${posts.length}件の記事をサイドバーに追加しました`);

    // 最新の記事を iframe に表示
    if (posts.length > 0) {
      const iframe = document.getElementById('post-frame');
      if (iframe) {
        iframe.src = posts[0].filename;
      }
    }

  } catch (error) {
    console.error('ブログ記事の自動検出に失敗しました:', error);
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