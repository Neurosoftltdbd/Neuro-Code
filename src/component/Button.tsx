import React from 'react';

const Button = ({data}  :any ) => {
    return (
        <button onClick={data.onClick} className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded w-fit">
            {data.name}
        </button>
    );
};

export default Button;