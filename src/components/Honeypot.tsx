// Invisible field real people never see or fill, but naive bots do. If it
// arrives with a value, the server treats the submission as a bot.
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: "auto", height: 0, width: 0, overflow: "hidden" }}
    >
      <label>
        Company website (leave this empty)
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
