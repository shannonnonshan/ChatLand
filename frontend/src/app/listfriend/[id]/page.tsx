'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, ArrowLeft } from 'lucide-react'

const users = [
  {
    id: 1,
    name: 'Michael Foster',
    email: 'michael.foster@example.com',
    avatar:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Team Lead',
    lastSeen: '2h ago',
    online: false,
    friends: [2, 4],
    posts: [
      {
        id: 1,
        description: 'Just a sunny day in the park ☀️',
        imageUrl:
          'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Apr 10, 2024',
      },
      {
        id: 2,
        description: 'Coffee break vibes ☕',
        imageUrl:
          'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Apr 12, 2024',
      },
    ],
  },
  {
    id: 2,
    name: 'Lindsay Walton',
    email: 'lindsay.walton@example.com',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Frontend Developer',
    lastSeen: '1d ago',
    online: false,
    friends: [1, 3],
    posts: [
      {
        id: 1,
        description: 'Morning walk 🌿',
        imageUrl:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'May 05, 2024',
      },
      {
        id: 2,
        description: 'City lights at night ✨',
        imageUrl:
          'https://images.unsplash.com/photo-1526481280690-7ead59e4b2bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'May 06, 2024',
      },
    ],
  },
  {
    id: 3,
    name: 'Dries Vincent',
    email: 'dries.vincent@example.com',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'UX Designer',
    lastSeen: '',
    online: true,
    friends: [2],
    posts: [
      {
        id: 1,
        description: 'Sketching wireframes for the new project ✏️',
        imageUrl:
          'https://images.unsplash.com/photo-1559027615-cd4628902d9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Jun 01, 2024',
      },
    ],
  },
  {
    id: 4,
    name: 'Leslie Alexander',
    email: 'leslie.alexander@example.com',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Project Manager',
    lastSeen: '3h ago',
    online: false,
    friends: [1],
    posts: [
      {
        id: 1,
        description: 'Kicking off a new project 🚀',
        imageUrl:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Jun 10, 2024',
      },
      {
        id: 2,
        description: 'Team brainstorming session 💡',
        imageUrl:
          'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Jun 12, 2024',
      },
    ],
  },
]


export default function ListFriendPage() {
  const router = useRouter()
  const { id } = useParams()
  const userId = Number(id)

  const user = users.find((u) => u.id === userId)
  const friendList = user ? users.filter((u) => user.friends.includes(u.id)) : []

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        User not found
      </div>
    )

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-500 text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Friends</h1>
          <div className="w-10" />
        </div>

        {/* Friends List */}
        {friendList.length > 0 ? (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-100 bg-white shadow-sm">
            {friendList.map((friend) => (
              <li
                key={friend.id}
                onClick={() => router.push(`/profile/${friend.id}`)}
                className="flex justify-between gap-x-6 p-4 items-center cursor-pointer hover:bg-gray-50 transition"
              >
                <div className="flex min-w-0 gap-x-4 items-center">
                  <Image
                    src={friend.avatar}
                    alt={friend.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold text-gray-900">
                      {friend.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {friend.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-x-4">
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm text-gray-900">{friend.role}</p>
                    {friend.online ? (
                      <div className="mt-1 flex items-center gap-x-1.5">
                        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        </div>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Last seen <time>{friend.lastSeen}</time>
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-gray-400 w-5 h-5" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No friends to display.
          </p>
        )}
      </div>
    </div>
  )
}
