import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../api/api";

export default function SetupAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/student/setupAccount`, {
        token,
        name: form.name,
        password: form.password,
      });

      alert("Setup thành công! Bạn có thể đăng nhập.");
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.error || "Setup thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-[400px] flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold">Setup Student Account</h2>
        <input
          type="text"
          placeholder="Username"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Setting up..." : "Setup Account"}
        </button>
      </form>
    </div>
  );
}
