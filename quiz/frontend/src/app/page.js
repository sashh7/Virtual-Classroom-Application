"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Quiz App</h1>
      
      <div className="flex justify-center space-x-6">
        {/* Teacher Button */}
        <Link
          href="/teacher"
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg"
        >
          Teacher
        </Link>

        {/* Student Button */}
        <Link
          href="/student"
          className="bg-green-600 text-white px-6 py-3 rounded text-lg"
        >
          Student
        </Link>
         {/* Student Future Scope Button */}
         <Link
          href="/student/future-scope"
          className="bg-purple-600 text-white px-6 py-3 rounded text-lg"
        >
          Student Future Scope
        </Link>
        <Link
          href="/teacher/future-scope"
          className="bg-red-600 text-white px-6 py-3 rounded text-lg"
        >
          Upload Future Scope
        </Link>
      </div>
    </main>
  );
}