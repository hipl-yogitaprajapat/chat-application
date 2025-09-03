"use client"
import { useRegiserSchema } from "@/app/validation/authschema";
import { useAppDispatch } from "@/store/hooks";
import { registerUserThunk } from "@/store/slices/authSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { signIn } from "next-auth/react"


const UserRegister = () => {
  const dispatch = useAppDispatch();
  const router = useRouter()
    const registerUserSchema = useRegiserSchema();
    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerUserSchema),
  });

  const onSubmit=async(userData:any)=>{
    try {
     const result = await dispatch(registerUserThunk(userData)).unwrap();
      toast.success(result.message)
        router.push(`/login`)
        reset({})
    } catch (err:any) {
      toast.error(err.message); 
    }
  }

  const googleClientId:string = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              FirstName
            </label>
            <input
              type="text"
              {...register("firstName")}
              placeholder="Please enter  first name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  {errors?.firstName && <div className='text-red-700 text-sm pt-1.5'>{errors?.firstName?.message}</div>}
          </div>

           <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              LastName
            </label>
            <input
              type="text"
              {...register("lastName")}
              placeholder="Please enter last name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  {errors?.lastName && <div className='text-red-700 text-sm pt-1.5'>{errors?.lastName?.message}</div>}

          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company
            </label>
            <input
              type="text"
              {...register("company")}
              placeholder="Please enter last name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  {errors?.company && <div className='text-red-700 text-sm pt-1.5'>{errors?.company?.message}</div>}
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Please enter email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  {errors?.email && <div className='text-red-700 text-sm pt-1.5'>{errors?.email?.message}</div>}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Please enter password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                  {errors?.password && <div className='text-red-700 text-sm pt-1.5'>{errors?.password?.message}</div>}
          </div>
              <div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
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
            </div> */}

            <button 
                        onClick={() => signIn("google")} 
                        className="p-2 bg-blue-500 text-white rounded"
                      >
                        Login with Google
                      </button>
                      <button 
                        onClick={() => signIn("github")} 
                        className="p-2 bg-gray-800 text-white rounded"
                      >
                        Login with GitHub
                      </button>
      </div>
    </div>
  );
};

export default UserRegister;
