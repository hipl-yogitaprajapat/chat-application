interface MessageState{
  users:User | any,
  isLoading: boolean,
  error: any,
  text: string,
  success: boolean,
  message:any
  selectedUser: User | null,
}

 interface User {
  _id: string;
  firstName: string;
  lastName: string;
}
interface MessageResponse {
    success: any;
    message: any;
    errors?: any;
    data: any;
    email: any;
}