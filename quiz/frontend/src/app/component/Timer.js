"use client"
import { useEffect, useState } from "react"

export default function Timer({ initialSeconds, onTimeUp, className = "" }) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [seconds, onTimeUp])

  // Format time as MM:SS
  const formatTime = () => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isLowTime = seconds < 60

  return (
    <div
      className={`font-mono font-bold rounded-full px-4 py-2 ${
        isLowTime ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      } ${className}`}
    >
      {formatTime()}
    </div>
  )
}

