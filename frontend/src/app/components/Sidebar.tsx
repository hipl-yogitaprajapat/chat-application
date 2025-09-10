"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { LogoutUser, removeProfile, UpdateUserProfile, viewProfile } from "@/store/slices/authSlice";
import { chatSidebarThunk, clearUnread, markMessagesAsReadThunk, setSelectedUser } from "@/store/slices/messageSlice";
import { removeCookie } from "@/utils/commons";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { Plus, Trash } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, unreadCounts,selectedUser  } = useAppSelector((state) => state.messages);
  const { profile } = useAppSelector((state) => state.auth);
  const [userName, setUserName] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    dispatch(chatSidebarThunk());
    const storedName = localStorage.getItem("name");
    const storedCompany = localStorage.getItem("company");
    setUserName(storedName);
    setCompany(storedCompany);
    dispatch(viewProfile());
  }, [dispatch]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const previewURL = URL.createObjectURL(file);
    setProfileImage(previewURL);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await dispatch(UpdateUserProfile(formData)).unwrap();
      toast.success(result.message)
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveProfile=async()=>{
    try {
      const result = await dispatch(removeProfile()).unwrap();
      toast.success(result.message)
    } catch (err: any) {
      toast.error(err.message);
    }
    
  }

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
              profileImage
                ? profileImage
                : profile?.image
                  ? `http://localhost:5001/uploads/${profile.image}`
                  : "https://randomuser.me/api/portraits/men/1.jpg"
            }
            alt="profile"
            className="w-full h-full rounded-full object-cover border-2 border-gray-200"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition"
            title="Change Profile"
          >
            <Plus size={14} />
          </button>

          {profileImage || profile?.image ? (
            <button
              onClick={handleRemoveProfile}
              className="absolute bottom-0 left-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              title="Remove Profile"
            >
              <Trash size={14} />
            </button>
          ) : null}

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <div>
          <h2 className="font-semibold">{session?.user?.name || userName}</h2>
          {!session?.user && company && (<p className="text-sm text-gray-500">{company}</p>)}
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
