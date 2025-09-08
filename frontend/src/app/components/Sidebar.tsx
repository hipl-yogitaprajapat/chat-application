"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LogoutUser } from "@/store/slices/authSlice";
import { chatSidebarThunk, setSelectedUser } from "@/store/slices/messageSlice";
import { removeCookie } from "@/utils/commons";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

const Sidebar = () => {
  const { data: session } = useSession()
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.messages);
  const [userName, setUserName] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    dispatch(chatSidebarThunk());
    const storedName = localStorage.getItem("name");
    const storedCompany = localStorage.getItem("company");
    setUserName(storedName);
    setCompany(storedCompany);
  }, [dispatch]);

  // filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!searchTerm) return users;

    return users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleLogout = async () => {
    try {
      const result = await dispatch(LogoutUser()).unwrap();
      console.log(result,"resultyyyyyy");
       toast.success(result.message)
      removeCookie("token");
      removeCookie("is_login");
      removeCookie("role");
      router.push(`/login`)
    } catch (err: any) {
      toast.error(err.message); 
    }
  }

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded-lg border bg-gray-50"
        />
      </div>

      <div className="overflow-y-auto flex-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
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
          ))
        ) : (
          <div className="p-3 text-gray-400 text-center">No users found</div>
        )}
      </div>
   {session ? (
        <button
          onClick={() => signOut()}
          className="p-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="p-2 bg-green-200 text-white rounded"
        >
          Logout
        </button>
      )
      }
    </div>
  );
};

export default Sidebar;
