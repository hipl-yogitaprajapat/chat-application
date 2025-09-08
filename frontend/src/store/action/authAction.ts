import axiosInstance from "@/lib/axios";

const hostName = process.env.NEXT_PUBLIC_SITE_URL!

export async function registerAction(userData:any):Promise<any>{
    try {
        const response = await axiosInstance.post(`${hostName}auth/signup`,userData,{
          headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
        })
        return response.data
    } catch (error:any) { 
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message || "Something went wrong" };
    }
}

export async function loginUser(userData:any):Promise<any>{
    try {
        const response = await axiosInstance.post(`${hostName}auth/login`,userData,{
          headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
        })
        return response.data
    } catch (error:any) { 
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message || "Something went wrong" };
    }
}

export async function logout():Promise<any>{
    try {
        const response = await axiosInstance.post(`${hostName}auth/logout`,{},{
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' }
        })
        return response.data
    } catch (error:any) { 
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message || "Something went wrong" };
    }
}

export async function googlelogin(code:any):Promise<any>{
    try {
        const response = await axiosInstance.get(`${hostName}auth/google?code=${code}`,{
          headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
        })
        return response.data
    } catch (error:any) { 
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message || "Something went wrong" };
    }
  }
