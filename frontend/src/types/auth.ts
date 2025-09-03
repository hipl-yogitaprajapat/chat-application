interface AuthState{
  user: any,
  isLoading: boolean,
  error: any,
  message: string,
  success: boolean,
  token:string
}

interface AuthResponse {
    success: any;
    message: any;
    errors?: any;
    data: any;
    email: any;
}

interface RegisterFormData {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    password:string;
}