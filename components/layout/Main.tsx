import React from 'react';

type MainProps = {
  children: React.ReactNode;
};

export default function Main({ children }: MainProps) {
  return (
    <main className="relative flex-1">
      <div className="relative">{children}</div>
    </main>
  );
}
