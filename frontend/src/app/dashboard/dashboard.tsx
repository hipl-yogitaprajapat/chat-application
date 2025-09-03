"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const dashboard = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
        <Sidebar/>
        
      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Chat header */}
        <div className="p-4 border-b flex items-center gap-2">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Dianne"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h2 className="font-semibold">Dianne Jhonson</h2>
            <p className="text-xs text-green-500">● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="flex">
            <div className="bg-blue-100 p-3 rounded-lg max-w-sm">
              Hi David, have you got the project report pdf?
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-sm">
              NO. I did not get it
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-100 p-3 rounded-lg max-w-sm">
              Ok, I will just sent it here. Plz be sure to fill the details by today end of the day.
              <div className="mt-2">
                <div className="p-2 bg-white rounded border flex items-center gap-2">
                  📄 project_report.pdf
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-sm">
              Ok. Should I send it over email as well after filling the details.
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-100 p-3 rounded-lg max-w-sm">
              Ya. I’ll be adding more team members to it.
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-500 text-white p-3 rounded-lg max-w-sm">OK</div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write Something..."
            className="flex-1 p-2 rounded-full border bg-gray-50"
          />
          <button className="p-2">😊</button>
          <button className="p-2">📎</button>
          <button className="p-2 bg-blue-500 text-white rounded-full px-4">➤</button>
        </div>
      </div>
    </div>
  );
}
export default dashboard