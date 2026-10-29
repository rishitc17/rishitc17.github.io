try {document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');} catch {}
