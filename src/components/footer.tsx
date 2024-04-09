export default function Footer() {
  return (
    <>
      <footer>
        <div className="w-full max-w-screen-xl py-4 items-center justify-between flex flex-col-reverse sm:flex-row gap-4 sm:gap-0">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2024{" "}
            <a href="#" className="hover:underline">
              Bhayanak™
            </a>
          </span>
          <ul className="flex flex-wrap items-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
            <li>
              <a
                href="https://discord.gg/879CFrn"
                className="hover:underline me-4 md:me-6"
              >
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://github.com/theHimanshuShekhar/bhayanak_streamer"
                className="hover:underline me-4 md:me-6"
              >
                Github
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
