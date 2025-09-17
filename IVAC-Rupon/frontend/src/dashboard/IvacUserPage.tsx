
import DashboardLayout from './DashboardLayout'

export default function IvacUserPage() {
    const ivacUsers = [
        {id:1, name:'John Doe', email:'user@ivacbd.com', role:'Admin', status:'Active', deviceId:['12345', '67890']},
        {id:2, name:'Jane Smith', email:'   ', role:'User', status:'Inactive', deviceId:['54321']},
        {id:3, name:'Alice Johnson', email:'    ', role:'User', status:'Active', deviceId:[]},
        {id:4, name:'Bob Brown', email:'   ', role:'User', status:'Active', deviceId:['98765', '43210']},
    ];
    return (
        <DashboardLayout>
            <div>
                <h1 className='text-3xl font-bold text-gray-800 py-3'>Ivac Users Page</h1>
                <hr />
                <div className='mt-4'>
                    <table className='min-w-full border border-gray-300'>
                        <thead className='bg-gray-200'>
                            <tr>
                                <th className='border border-gray-300 px-4 py-2'>ID</th>
                                <th className='border border-gray-300 px-4 py-2'>Name</th>
                                <th className='border border-gray-300 px-4 py-2'>Email</th>
                                <th className='border border-gray-300 px-4 py-2'>Role</th>
                                <th className='border border-gray-300 px-4 py-2'>Status</th>
                                <th className='border border-gray-300 px-4 py-2'>Device Count</th>
                                <th className='border border-gray-300 px-4 py-2'>Device id</th>
                                <th className='border border-gray-300 px-4 py-2'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                ivacUsers.map((user, i)=>(
                                    <tr key={i} className={i%2===0?'bg-white':'bg-gray-100'}>
                                <td className='border border-gray-300 px-4 py-2'>{user.id}</td>
                                <td className='border border-gray-300 px-4 py-2'>{user.name}</td>
                                <td className='border border-gray-300 px-4 py-2'>{user.email}</td>
                                <td className='border border-gray-300 px-4 py-2'>{user.role}</td>
                                <td className='border border-gray-300 px-4 py-2'>{user.status}</td>
                                <td className='border border-gray-300 px-4 py-2'>{user.deviceId.length}</td>
                                <td className='border border-gray-300 px-4 py-2'>{user.deviceId.map(item=>item + "\n")}</td>
                                <td className='border border-gray-300 px-4 py-2 flex gap-2 justify-center'>
                                    <button className='bg-blue-500 text-white rounded px-2 py-1 mr-2 hover:bg-blue-600'>Edit</button>
                                    <button className='bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600'>Delete</button>
                                </td>
                            </tr>
                                ))
                            }  
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}
