import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-green-500 font-mono">404</h1>
        <h2 className="text-2xl text-green-400 font-mono">
          $ command not found
        </h2>
        <p className="text-gray-400 font-mono">
          The page you're looking for doesn't exist in this directory.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-500/20 text-green-400 font-mono border border-green-500 hover:bg-green-500/30 transition-colors"
          >
            $ cd ~
          </Link>
        </div>
      </div>
    </div>
  );
}
