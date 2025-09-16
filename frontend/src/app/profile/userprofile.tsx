"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { viewProfile, UpdateUserProfile, removeProfile } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const router = useRouter()
  const { profile } = useAppSelector((state) => state.auth);

  console.log(profile,"profile");
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load profile on mount
  useEffect(() => {
    dispatch(viewProfile());
  }, [dispatch]);

  // Prefill form when profile changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setCompany(profile.company || "");
    }
  }, [profile]);

  // Handle profile update (image + text fields)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("company", company);
    if (password) formData.append("password", password);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    try {
      const result = await dispatch(UpdateUserProfile(formData)).unwrap();
      toast.success(result.message);
      setPassword("");
      router.push(`/dashboard`)
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Remove profile picture
  const handleRemoveProfile = async () => {
    try {
      const result = await dispatch(removeProfile()).unwrap();
      toast.success(result.message);
      dispatch(viewProfile());
      setPreviewImage(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
        </div>

        {/* Profile Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white shadow rounded-2xl p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center relative">
                <img
                  className="w-24 h-24 rounded-full border-4 border-indigo-200 shadow"
                  src={
                    previewImage
                      ? previewImage
                      : profile?.image
                      ? `http://localhost:5001/uploads/${profile.image}`
                      : "../assets/images/user/avatar-5.jpg"
                  }
                  alt="User"
                />

                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const previewURL = URL.createObjectURL(e.target.files[0]);
                      setPreviewImage(previewURL);
                    }
                  }}
                />

                <div className="mt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    Change Image
                  </button>
                  {profile?.image || previewImage ? (
                    <button
                      type="button"
                      onClick={handleRemoveProfile}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Personal Details Form */}
              <div>
                <h4 className="text-lg font-bold text-gray-700 mb-4">
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full mt-1 p-2 border rounded"
                      placeholder="Leave blank to keep same"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Copyright © <a href="#">Codedthemes</a>
          </p>
          <ul className="flex space-x-4 text-sm text-gray-500">
            <li><a href="#">Home</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Contact us</a></li>
          </ul>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserProfile;
