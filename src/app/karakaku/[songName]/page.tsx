'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const Karakaku = dynamic(() => import('@/components/Karakaku/Karakaku'), { ssr: false });

const SongPage: React.FC = () => {
  const params = useParams();
  const songName = params?.songName;

  if (!songName || Array.isArray(songName)) {
    return <div>Loading...</div>;
  }

  return <Karakaku songName={songName} />;
};

export default SongPage;