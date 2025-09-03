    import axiosInstance from "@/lib/axios";

    const hostName = process.env.NEXT_PUBLIC_SITE_URL!

    export async function chatSidebar():Promise<any>{
        try {
            const response = await axiosInstance.get(`${hostName}messages/users`,{
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