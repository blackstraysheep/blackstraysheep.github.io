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

// ブログ記事をJSONから取得してサイドバーに追加する関数
async function autoDetectBlogPosts() {
  const sidebarList = document.querySelector('.sidebar-list');
  if (!sidebarList) return;

  try {
    const response = await fetch('posts.json');
    const data = await response.json();
    sidebarList.innerHTML = '';

    // 古語日記セクション
    if (data.kogo && data.kogo.length > 0) {
      const kogoHeader = document.createElement('h3');
      kogoHeader.textContent = '古語日記';
      sidebarList.appendChild(kogoHeader);
      const kogoUl = document.createElement('ul');
      kogoUl.className = 'kogo-list';
      data.kogo.forEach(post => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = post.filename;
        link.className = 'post-link';
        link.target = 'post-frame';
        link.textContent = `${post.date} – ${post.title}`;
        li.appendChild(link);
        kogoUl.appendChild(li);
      });
      sidebarList.appendChild(kogoUl);
    }

    // 通常記事セクション
    if (data.normal && data.normal.length > 0) {
      const normalHeader = document.createElement('h3');
      normalHeader.textContent = '通常記事';
      sidebarList.appendChild(normalHeader);
      const normalUl = document.createElement('ul');
      normalUl.className = 'normal-list';
      data.normal.forEach(post => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = post.filename;
        link.className = 'post-link';
        link.target = 'post-frame';
        link.textContent = `${post.date} – ${post.title}`;
        li.appendChild(link);
        normalUl.appendChild(li);
      });
      sidebarList.appendChild(normalUl);
    }

    // 最新記事（古語日記優先）
    const latest = (data.kogo && data.kogo[0]) || (data.normal && data.normal[0]);
    if (latest) {
      const iframe = document.getElementById('post-frame');
      if (iframe) {
        iframe.src = latest.filename;
      }
    }
  } catch (error) {
    sidebarList.innerHTML = '<li>記事リストの取得に失敗しました</li>';
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