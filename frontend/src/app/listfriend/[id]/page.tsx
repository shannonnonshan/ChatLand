'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useChat, Friend } from '@/hooks/useChat'
export default function ListFriendsPage() {
  const { id } = useParams()
  const userId = Number(id)

  interface FriendRequest {
    id: number
    sender: {
      name: string
      email: string
    }
  }

  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingFriends, setLoadingFriends] = useState(true)
  const { openChat } = useChat()
  // ===== Fetch Friend Requests =====
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/friend-requests/${userId}`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to fetch friend requests')
        setRequests(Array.isArray(data) ? data : data?.data || [])
      } catch (err) {
        console.error("Failed to load friend requests:", err)
        setRequests([])
      } finally {
        setLoadingRequests(false)
      }
    }

    fetchRequests()
  }, [userId])

  // ===== Fetch Friends List =====
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/friends`
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to fetch friends')
        setFriends(Array.isArray(data) ? data : data?.data || [])
      } catch (err) {
        console.error("Failed to load friends:", err)
        setFriends([])
      } finally {
        setLoadingFriends(false)
      }
    }

    fetchFriends()
  }, [userId])

  // ===== Handle Friend Request Accept/Reject =====
  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/${requestId}/${action}`,
      { method: 'PATCH' }
    )
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
    if (action === 'accept') {
      // reload friends list
      setLoadingFriends(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/friends`)
      const data = await res.json()
      setFriends(Array.isArray(data) ? data : data?.data || [])
      setLoadingFriends(false)
    }
  }

  // ===== Handle Cancel Friend =====
  const handleCancelFriend = async (friendId: number) => {
    const confirmed = confirm("Are you sure you want to remove this friend?")
    if (!confirmed) return

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/friend/${friendId}/cancel`,
        { method: 'PATCH' }
      )
      if (!res.ok) throw new Error('Failed to cancel friend')
      setFriends((prev) => prev.filter((f) => f.id !== friendId.toString()))
    } catch (err) {
      console.error(err)
      alert('Failed to cancel friend')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-10">
      {/* Friend Requests */}
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          Friend Requests
        </h1>
        {loadingRequests ? (
          <p className="text-center mt-10">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-500 text-center">No friend requests found.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex justify-between items-center p-4 border rounded-md shadow-sm"
              >
                <div>
                  <p className="font-medium">{req.sender.name}</p>
                  <p className="text-sm text-gray-500">{req.sender.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestAction(req.id, 'accept')}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(req.id, 'reject')}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Friends List */}
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          Friends
        </h1>
        {loadingFriends ? (
          <p className="text-center mt-10">Loading...</p>
        ) : friends.length === 0 ? (
          <p className="text-gray-500 text-center">No friends found.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <li
                key={friend.id}
                onClick={() => {
                  // tạo đối tượng Friend cho useChat
                  const chatFriend: Friend = {
                      id: friend.id.toString(), 
                      name: friend.name,
                      avatar: friend.avatar || "/logo.png",
                      messages: [],
                      online: false,
                      lastMessage: undefined,
                    }
                    openChat(chatFriend)
                  }}
                className="flex justify-between items-center p-4 border rounded-md shadow-sm cursor-pointer hover:bg-slate-100"
              >
                <div>
                  <p className="font-medium">{friend.name}</p>
                  {/* <p className="text-sm text-gray-500">{friend.email}</p> */}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation() 
                    handleCancelFriend(Number(friend.id))
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Cancel Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
