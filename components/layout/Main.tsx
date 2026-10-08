import React from 'react';

type MainProps = {
  children: React.ReactNode;
};

export default function Main({ children }: MainProps) {
  return (
    <main className="relative flex flex-1 flex-col">
      <div className="relative flex flex-1 flex-col">{children}</div>
    </main>
  );
}
