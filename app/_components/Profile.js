import Avatar from '@/app/_components/Avatar';
import { auth } from '../_lib/auth';

async function Profile() {
  const session = await auth();
  const { user } = session;
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-6">
        <Avatar avatar={user?.image} alt="Profile" height="60" width="60" />
        <div>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className=" text-lg">{user?.email}</p>
        </div>
      </div>
      <div className="mt-8">
        <form className="mt-4 space-y-4">
          <label htmlFor="fullName">Name</label>
          <input
            id="fullName"
            type="text"
            name="fullname"
            defaultValue={user?.name}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
            disabled
            autoComplete="off"
          />

          <label className="block " htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            defaultValue={user?.email}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
            disabled
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}

export default Profile;
