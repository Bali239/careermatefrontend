import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <div className="flex h-screen">
        <aside className="flex flex-col w-64 h-screen p-3 bg-gray-800 text-white">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </li>
          <li className="mb-2">
            <a href="/dashboard/profile" className="hover:underline">Profile</a>
          </li>
          <li className="mb-2">
            <a href="/dashboard/cv" className="hover:underline">CV</a>
          </li>
          <li className="mb-2">
            <a href="/dashboard/chat" className="hover:underline">Chat</a>
          </li>
        </ul>
      </nav>
    </aside>
    <main className="flex-1 p-6 bg-gray-100">
      {children}
    </main>
    </div>
    </>
  )
}
