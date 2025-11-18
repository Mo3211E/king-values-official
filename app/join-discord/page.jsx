export default function JoinDiscord() {
  return (
    <div className="text-center pt-32">
      <h1 className="text-4xl font-bold mb-6">Join our Discord</h1>
      <p className="text-lg mb-6">
        You must join our Discord server to unlock unlimited trade slots,
        manage trades, and stay updated.
      </p>
      <a
        href="https://discord.gg/cUGkAtsFNT"
        className="px-6 py-3 text-xl rounded-xl font-bold text-white"
        style={{
          background: "linear-gradient(90deg, #c77dff, #8d4eff)"
        }}
      >
        Join Discord
      </a>
    </div>
  );
}
