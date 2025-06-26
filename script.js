document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  toggle.addEventListener('click', () => {
    navList.classList.toggle('show');
  });
});

//サイドバーリンクの自動更新
 document.querySelectorAll('.sidebar-list .post-link').forEach(link => {
   fetch(link.href)
     .then(res => res.text())
     .then(html => {
       const doc = new DOMParser().parseFromString(html, 'text/html');
       const title = doc.querySelector('#post-content h2')?.textContent.trim();
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