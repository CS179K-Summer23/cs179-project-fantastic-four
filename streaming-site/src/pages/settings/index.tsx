import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

function Settingpage(): JSX.Element {
  const [profile, setProfile] = useState({
    profilePicture: "",
    username: "",
    email: "",
    birthday: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>

      <main className="flex-1">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative flex items-center">
              <div className="flex items-center">
                <img
                  src={
                    profile.profilePicture ||
                    "path/to/default/profile/picture.png"
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
                <input
                  type="file"
                  name="profilePicture"
                  className="ml-4"
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      profilePicture: URL.createObjectURL(e.target.files?.[0]),
                    })
                  }
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded ml-4">Add Profile Picture</button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="col-span-1">
                  <label htmlFor="username" className="text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="email" className="text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="birthday" className="text-gray-700">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={profile.birthday}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="name" className="text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Settingpage;
