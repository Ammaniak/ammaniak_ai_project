import { useState } from "react";
import { useRouter } from "next/router";
import { login } from "@/service/userService";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(username, email);
      router.push("/transcriptions"); // Redirect to home on success
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <input
          className="w-full px-3 py-2 mb-3 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 mb-3 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
