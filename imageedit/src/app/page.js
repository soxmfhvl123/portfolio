'use client';

import { useState } from 'react';
import ShaderLab from '@/components/ShaderLab';

export default function Home() {
  const [image, setImage] = useState(null);

  const handleDrop = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <ShaderLab image={image} onDrop={handleDrop} />
    </main>
  );
}
