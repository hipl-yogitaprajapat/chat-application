"use client"
import { useLoginSchema } from "@/app/validation/authschema";
import { useAppDispatch } from "@/store/hooks";
import { loginUserThunk } from "@/store/slices/authSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react"
import { useState } from "react";
import Image from 'next/image';


const UserLogin = () => {
  const dispatch = useAppDispatch();
  const [showUserPassword, setShowUserPassword] = useState(false);
  const router = useRouter()
  const loginSchema = useLoginSchema()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (userData: any) => {
    try {
      const result = await dispatch(loginUserThunk(userData)).unwrap();
      toast.success(result.message)
      router.push(`/dashboard`)
      reset({})
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const redirectUri = "http://localhost:5001/api/auth/callback/github";

  const handleGithubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=user:email`;
  };
  const googleClientId: string = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="text"
              {...register("email")}
              placeholder="Please enter email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors?.email && <div className='text-red-700 text-sm pt-1.5'>{errors?.email?.message}</div>}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative"> 
            <input
              // type="password"
              type={showUserPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Please enter password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowUserPassword((prev) => !prev)}
            >
              {showUserPassword ? (
                <Image
                  src="/icons/eye-close.svg"
                  alt="eye-close"
                  width={24}
                  height={24}
                  className="invert-0 brightness-0"
                />
              ) : (
                <Image
                  src="/icons/eye-outline.svg"
                  alt="eye"
                  width={24}
                  height={24}
                  className="invert-0 brightness-0"
                />
              )}
            </span>
            </div>
            {errors?.password && <div className='text-red-700 text-sm pt-1.5'>{errors?.password?.message}</div>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-5">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        {/* <div className="row">
              <div className="col-4">
                <div className="d-grid">
                    <GoogleOAuthProvider clientId={googleClientId}>
                    <GoogleComponent/>
                    </GoogleOAuthProvider> 
                </div>
              </div>
            </div>

            <button
  onClick={handleGithubLogin}
  className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition"
>
  Continue with GitHub
</button> */}

        <div className="flex flex-col items-center gap-4 mt-10">
          {/* {session ? (
        <>
          <p>Welcome, {session.user?.name} {session.user?.email}</p>
          <button 
            onClick={() => signOut()} 
            className="p-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <> */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="p-2 bg-blue-500 text-white rounded cursor-pointer"
          >
            Login with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="p-2 bg-gray-800 text-white rounded cursor-pointer"
          >
            Login with GitHub
          </button>
          {/* </>
      )} */}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
