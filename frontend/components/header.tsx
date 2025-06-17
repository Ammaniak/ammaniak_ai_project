import Link from "next/link";
import { useEffect, useState } from "react";

const Header: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  const handleClick = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("transcript");
    setLoggedIn(false);
  };
  return (
    <header className="p-3 mb-3 border-bottom bg-gradient-to-br from-gray-900 to-gray-600 flex flex-col items-center">
      <a className="flex  mb-2 md:mb-5 text-white-50 text-3xl text-gray-300">
        TRANSCRIBER
      </a>
      <nav className="items-center flex md:flex-row flex-col">
        <Link
          href="/tools"
          className=" px-4 text-xl text-white  hover:bg-gray-600 rounded-lg"
        >
          Transcription Tool
        </Link>
        <Link
          href="/transcriptions"
          className="px-4  text-white text-xl hover:bg-gray-600 rounded-lg"
        >
          Your Transcriptions
        </Link>
        {loggedIn && (
          <a
            href="/login"
            onClick={handleClick}
            className="px-4  text-white text-xl hover:bg-gray-600 rounded-lg"
          >
            Logout
          </a>
        )}
      </nav>
    </header>
  );
};

export default Header;
