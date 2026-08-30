'use client';

import { useEffect } from 'react';

export default function ArticlePdfLinks() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a') as HTMLAnchorElement | null;
      if (
        !link ||
        !['Open PDF ↗', 'Open or download PDF'].includes(
          link.textContent?.trim() || '',
        )
      )
        return;
      const articlePath =
        location.pathname.match(/^\/articles\/[^/]+$/)?.[0] ||
        (
          link
            .closest('article')
            ?.querySelector('a[href^="/articles/"]') as HTMLAnchorElement | null
        )?.getAttribute('href');
      if (!articlePath) return;
      event.preventDefault();
      location.href = `${articlePath}/pdf`;
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  return null;
}
