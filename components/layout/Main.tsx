import React from 'react';

type MainProps = {
  children: React.ReactNode;
};

export default function Main({ children }: MainProps) {
  return (
    <main className="flex-1">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-blue-50 via-transparent to-transparent dark:from-blue-900/20" />
      </div>

      <div className="relative">{children}</div>
    </main>
  );
}
