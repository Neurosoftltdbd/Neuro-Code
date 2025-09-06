import {create} from "zustand/react";
interface ivacStateType {
    messageList: object[];
    setMessage: (success: boolean, message: string) => void;
    clearMessage: () => void
}
const ivacState = create<ivacStateType>((set)=>({
    messageList:[{"success":true,"message":"Welcome to IVAC"}],
    setMessage:(success, message)=> {
        set((state)=>(
            {messageList: [...state.messageList, {"success":success,"message":message}]}
        ));
    },
    clearMessage:()=> {
        set({messageList: []});
    },





}));

export default ivacState;