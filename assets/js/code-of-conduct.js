(() => {
  const container = document.getElementById('code-of-conduct-content');

  if (!container) return;

  const sourceUrl = container.dataset.source;
  const repositoryUrl = container.dataset.repository;
  const repositoryFileUrl = `${repositoryUrl}/blob/main/`;
  const rawFileUrl = `${repositoryUrl.replace('https://github.com', 'https://raw.githubusercontent.com')}/main/`;

  const showError = () => {
    container.innerHTML = `
      <div class="alert alert-warning" role="alert">
        The Code of Conduct could not be loaded right now.
        <a href="${repositoryUrl}">Read it on GitHub</a>.
      </div>
    `;
  };

  if (!sourceUrl || !repositoryUrl || typeof window.marked === 'undefined' || typeof window.DOMPurify === 'undefined') {
    showError();
    return;
  }

  fetch(sourceUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      return response.text();
    })
    .then((markdown) => {
      const rendered = window.marked.parse(markdown, { gfm: true });
      container.innerHTML = window.DOMPurify.sanitize(rendered);

      const sourceTitle = container.querySelector('h1');
      if (sourceTitle?.textContent.trim().toLowerCase() === 'code of conduct') {
        sourceTitle.remove();
      }

      container.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        link.href = new URL(href, repositoryFileUrl).toString();
        link.rel = 'noopener noreferrer';
      });

      container.querySelectorAll('img[src]').forEach((image) => {
        const src = image.getAttribute('src');
        if (!src || src.startsWith('data:')) return;

        image.src = new URL(src, rawFileUrl).toString();
        image.classList.add('img-fluid');
      });
    })
    .catch(showError);
})();
