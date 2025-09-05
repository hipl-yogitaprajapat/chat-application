interface MessageState{
  users:User | any,
  isLoading: boolean,
  error: any,
  text: string,
  success: boolean,
  message:any,
  messages: Message[];
  onlineUsers: string[];
  selectedUser: User | null,
}
interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  text: string;
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