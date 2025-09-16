"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { viewProfile, UpdateUserProfile, removeProfile} from "@/store/slices/authSlice";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProfileSchema } from "../validation/authschema";
import { yupResolver } from "@hookform/resolvers/yup";

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const profileSchema = useProfileSchema();
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.auth);

  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    dispatch(viewProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        company: profile.company || "",
        password: "",
      });
    }
  }, [profile, reset]);

  // Handle update
  const onSubmit = async (data:any) => {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("company", data.company);
   if (data.password && data.password.trim() !== "") {
  formData.append("password", data.password);
}

    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    try {
      const result = await dispatch(UpdateUserProfile(formData)).unwrap();
      toast.success(result.message);
      router.push(`/dashboard`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Remove profile image
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  {...register("image")}
                  ref={(e) => {
                    fileInputRef.current = e;
                  }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const previewURL = URL.createObjectURL(e.target.files[0]);
                      setPreviewImage(previewURL);
                    }
                  }}
                />
                {errors.image && (
                  <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>
                )}

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

              {/* Personal Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-700 mb-4">
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500">First Name</label>
                    <input
                      type="text"
                      {...register("firstName")}
                      className="w-full mt-1 p-2 border rounded"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name</label>
                    <input
                      type="text"
                      {...register("lastName")}
                      className="w-full mt-1 p-2 border rounded"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Company</label>
                    <input
                      type="text"
                      {...register("company")}
                      className="w-full mt-1 p-2 border rounded"
                    />
                    {errors.company && (
                      <p className="text-red-600 text-sm">
                        {errors.company.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">New Password</label>
                    <input
                      type="password"
                      {...register("password")}
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

    </div>
  );
};

export default UserProfile;
