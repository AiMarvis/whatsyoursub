'use client';

import { useEffect, useState } from 'react';

export default function StagewiseWrapper() {
  const [StagewiseToolbar, setStagewiseToolbar] = useState(null);

  useEffect(() => {
    // 개발 모드에서만 stagewise 도구바 로드
    if (process.env.NODE_ENV === 'development') {
      import('@stagewise/toolbar-next')
        .then((module) => {
          setStagewiseToolbar(() => module.StagewiseToolbar);
        })
        .catch((error) => {
          console.warn('Stagewise toolbar could not be loaded:', error);
        });
    }
  }, []);

  // 개발 모드가 아니거나 컴포넌트가 로드되지 않은 경우 렌더링하지 않음
  if (process.env.NODE_ENV !== 'development' || !StagewiseToolbar) {
    return null;
  }

  const stagewiseConfig = {
    plugins: []
  };

  return <StagewiseToolbar config={stagewiseConfig} />;
} 