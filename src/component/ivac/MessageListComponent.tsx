import React from 'react';
import ivacState from "@/state/ivac_state";

const MessageListComponent = () => {
    const {messageList, clearMessage} = ivacState();
    return (
        <div>
            <div className="log-header flex items-center justify-between">
                <h3>Log message</h3>
                <button onClick={clearMessage} id="clear-log"
                        className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded w-fit">Clear Log
                </button>
            </div>
            <hr className="my-2"/>
            <div id="log-message" className="flex flex-col gap-1 overflow-y-scroll h-[80vh] no-scrollbar ">
                {
                    messageList && messageList.map((item, index) => item.success ?
                        <p key={index} className="text-green-600 p-1"><i className="bi bi-check-circle-fill"></i> {item.message}</p>
                        : <p key={index} className="text-red-600 p-1"><i className="bi bi-x-circle-fill"></i> {item.message}</p>)
                }
            </div>
        </div>
    );
};

export default MessageListComponent;