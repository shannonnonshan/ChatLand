"use client";

export default function SignInModal({
  onClose,
  onSwitchToSignUp,
}: {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-2xl font-bold text-center text-[#161853] md:text-4xl dark:text-white">
            Member Login
          </h1>


          <form className="space-y-4 md:space-y-6" action="#">
            {/* nút đăng nhập Google + Facebook thành 2 hàng */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm px-5 py-2.5"
              >
                <img
                  className="w-5 h-5"
                  src="https://cdn-icons-png.flaticon.com/128/300/300221.png"
                  alt="Google"
                />
                Login with Google
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm px-5 py-2.5"
              >
                <img
                  className="w-5 h-5"
                  src="https://cdn-icons-png.flaticon.com/128/5968/5968764.png"
                  alt="Facebook"
                />
                Login with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-3">
              <hr className="flex-1 border-t border-gray-300" />
              <span className="mx-2 text-gray-400 text-sm">or</span>
              <hr className="flex-1 border-t border-gray-300" />
            </div>

            {/* email + password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your email
              </label>
              <input
                type="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full text-white bg-[#EC255A] hover:bg-[#d02050] font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Sign in
            </button>

            <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet?{" "}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="font-medium text-[#EC255A] hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
