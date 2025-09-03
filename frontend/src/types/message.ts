interface MessageState{
  users: any,
  isLoading: boolean,
  error: any,
  text: string,
  success: boolean,
  message:any
}

interface MessageResponse {
    success: any;
    message: any;
    errors?: any;
    data: any;
    email: any;
}