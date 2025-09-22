"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LogoutUser, removeProfile, setAuthToken, setUser, UpdateUserProfile, viewProfile } from "@/store/slices/authSlice";
import { chatSidebarThunk, clearUnread, markMessagesAsReadThunk, setSelectedUser } from "@/store/slices/messageSlice";
import { removeCookie } from "@/utils/commons";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, unreadCounts, selectedUser } = useAppSelector((state) => state.messages);
  const { profile,token } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    dispatch(chatSidebarThunk());
    dispatch(viewProfile());
  }, [dispatch]);

 useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage && !token) {
      dispatch(setAuthToken(tokenFromStorage));
      dispatch(viewProfile());
      dispatch(chatSidebarThunk());
    }
  }, [dispatch, token]);

useEffect(() => {
  const handleSocialLogin = async () => {
     const tokenFromStorage = localStorage.getItem("token");
     console.log(tokenFromStorage,"tokenFromStorageeeee");
     
    if (!session) return;

    // prevent running multiple times
    // if (localStorage.getItem("socialLoginDone")) return;
     const existingToken = localStorage.getItem("token");
    if (existingToken) {
      dispatch(setAuthToken(existingToken));
      return;
    }

    try {
      console.log(session,"session7777");
      
      const { email, name } = session.user as any;
      const provider = (session.user as any).provider;
      const providerId = (session.user as any).id || (session.user as any).sub;

      const res = await fetch("http://localhost:5001/api/auth/social-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, provider ,providerId}),
      });

      if (!res.ok) throw new Error("Social login failed");

      const { token, user } = await res.json();
      console.log(token,"tokennnnnn");
      

      // Store token & user in Redux
      dispatch(setAuthToken(token));
      dispatch(setUser(user));

      // Store in localStorage if needed
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("socialLoginDone", "true");

      // Now call APIs that require token
      //  dispatch(viewProfile());
      //  dispatch(chatSidebarThunk());
    } catch (err) {
      console.error("Social login error:", err);
    }
  };

  handleSocialLogin();
}, [session, dispatch]);

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
      toast.success(result.message);
      removeCookie("token");
      removeCookie("is_login");
      removeCookie("role");
      router.push(`/login`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUserClick = (user: any) => {
    dispatch(setSelectedUser(user));
    dispatch(markMessagesAsReadThunk(user._id));
    dispatch(clearUnread(user._id));
  };

  return (
    <div className="w-1/4 bg-white border-r flex flex-col">
      <div className="p-4 border-b flex items-center gap-2 relative">
        <div className="relative w-16 h-16">
          <img
            src={
              profile?.image
                ? `http://localhost:5001/uploads/${profile.image}`
                : "https://randomuser.me/api/portraits/men/1.jpg"
            }
            alt="profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-200"
          />
        </div>

        <div>
          <h2 className="font-semibold">{session?.user?.name || `${profile?.firstName || ""} ${profile?.lastName || ""}`}</h2>
          {!session?.user && profile?.company && (<p className="text-sm text-gray-500">{profile?.company}</p>)}
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
        {filteredUsers.map((user) => {
          // const unread = unreadCounts[user._id] || 0;
          const unread = user._id === selectedUser?._id ? 0 : unreadCounts[user._id] || 0;

          return (
            <div
              key={user._id}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
              onClick={() => handleUserClick(user)}
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

              {unread > 0 ? (
                <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                  {unread}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Link href="/profile">
        <div className="p-2 bg-black text-white rounded mb-3 text-center text-white">Profile</div>
      </Link>
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
          className="p-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      )
      }
    </div>
  );
};

export default Sidebar;
