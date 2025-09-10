"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { viewProfile, UpdateUserProfile, removeProfile } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import { useEffect, useRef, useState } from "react";

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.auth);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load profile on mount
  useEffect(() => {
    dispatch(viewProfile());
  }, [dispatch]);

  // Handle profile image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await dispatch(UpdateUserProfile(formData)).unwrap();
      toast.success(result.message);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Remove profile picture
  const handleRemoveProfile = async () => {
    try {
      const result = await dispatch(removeProfile()).unwrap();
      toast.success(result.message);
      setPreviewImage(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Edit Profile
          </button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {/* Profile Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white shadow rounded-2xl p-6">
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

              {profile?.image || previewImage ? (
                <button
                  onClick={handleRemoveProfile}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              ) : null}

              <h3 className="mt-3 text-lg font-semibold text-gray-800">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <p className="text-gray-500">{profile?.company}</p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200"></div>

            {/* Personal Details */}
            <div>
              <h4 className="text-lg font-bold text-gray-700 mb-4">
                Personal Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="font-medium text-gray-800">
                    {profile?.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="font-medium text-gray-800">
                    {profile?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-800">{profile?.company}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Copyright © <a href="#">Codedthemes</a>
          </p>
          <ul className="flex space-x-4 text-sm text-gray-500">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Contact us</a>
            </li>
          </ul>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserProfile;
