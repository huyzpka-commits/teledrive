import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        <PlayerBar />
      </div>
    </div>
  );
}
