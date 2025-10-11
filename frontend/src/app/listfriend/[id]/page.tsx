'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ListRequestPage() {
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/friend-requests/${userId}`
      )
      const data = await res.json()
      setRequests(data)
      setLoading(false)
    }
    fetchRequests()
  }, [userId])

  const handleAction = async (requestId: number, action: 'accept' | 'reject') => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/friend-request/${requestId}/${action}`,
      { method: 'PATCH' }
    )
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Friend Requests</h1>

      {requests.length === 0 ? (
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
                  onClick={() => handleAction(req.id, 'accept')}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
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
  )
}
