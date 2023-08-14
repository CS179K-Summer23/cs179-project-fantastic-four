import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

function Settingpage(): JSX.Element {
  const [profile, setProfile] = useState({
    profilePicture: "",
    username: "",
    email: "",
    birthday: "",
    age: "",
    name: "",
    debit: "",
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-20 h-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {/* <img
                  src={
                    profile.profilePicture ||
                    "path/to/default/profile/picture.png"
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                /> */}
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
                <button className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded ml-4">
                  Update Profile Picture
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative">
              <div className="grid grid-rows-5 gap-4 w-full">
                <div className="col-span-1">
                  <label htmlFor="username" className="text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="name" className="text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="email" className="text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="birthday" className="text-gray-700">
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={profile.birthday}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="age" className="text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="debit" className="text-gray-700">
                    Debit
                  </label>
                  <input
                    disabled
                    type="number"
                    name="debit"
                    value="10000"
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
              </div>
              <button className="float-right bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded mt-4">
                Submit Changes
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Settingpage;
