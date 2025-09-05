"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { chatSidebarThunk, setSelectedUser } from "@/store/slices/messageSlice";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.messages);
  const [userName, setUserName] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  useEffect(() => {
    dispatch(chatSidebarThunk());
    const storedName = localStorage.getItem("name");
    const storedCompany = localStorage.getItem("company");
    setUserName(storedName);
    setCompany(storedCompany);
  }, [dispatch]);

  return (
    <div className="w-1/4 bg-white border-r flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <img
          src="https://randomuser.me/api/portraits/men/1.jpg"
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h2 className="font-semibold">{userName}</h2>
          <p className="text-sm text-gray-500">{company}</p>
        </div>
      </div>

      <div className="p-3">
        <input
          type="text"
          placeholder="Search Here..."
          className="w-full p-2 rounded-lg border bg-gray-50"
        />
      </div>

      <div className="overflow-y-auto flex-1">
        {Array.isArray(users) &&
          users.map((user) => (
            <div
              key={user._id}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
              onClick={() => dispatch(setSelectedUser(user))}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
      </div>

    </div>
  );
};

export default Sidebar;
