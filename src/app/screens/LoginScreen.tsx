import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { DEMO_EMAIL, useApp } from "../store";
import { MascotHappy } from "../components/Mascots";
import { Btn, Field, inputCls } from "../components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginScreen() {
  const { login, lastEmail } = useApp();
  const [email, setEmail] = useState(lastEmail);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const submit = (e?: React.FormEvent, em = email, pw = password) => {
    e?.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!em.trim()) next.email = "Pop in your email so we know it's you.";
    else if (!EMAIL_RE.test(em.trim()))
      next.email = "That doesn't look like an email, try name@kmitl.ac.th";
    if (!pw) next.password = "Password can't be empty.";
    setErrors(next);
    setNotice("");
    if (Object.keys(next).length) return;
    setBusy(true);
    window.setTimeout(() => login(em.trim(), remember), 650);
  };

  const signInDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword("demo-password");
    submit(undefined, DEMO_EMAIL, "demo-password");
  };

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="bg-[#E35205] border-b-2 border-hn-line px-5 pt-6 pb-0 relative overflow-hidden">
        <div className="flex items-end gap-2">
          <div className="flex-1 pb-6 hn-rise">
            <p className="text-black text-[10px] font-black tracking-[0.2em] uppercase mb-2">
              KMITL Campus
            </p>
            <h1 className="text-[40px] font-black text-black leading-none tracking-tight">
              HongNam<span className="text-white">.</span>
            </h1>
            <p className="text-black/80 text-sm font-bold mt-2">
              ปวดปุ๊บ เจอปั๊บ
            </p>
          </div>
          <div className="w-[120px] flex-shrink-0 -mb-0.5 hn-pop">
            <MascotHappy className="w-full h-auto" />
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="px-4 pt-6 flex flex-col gap-3 hn-rise"
      >
        <div className="mb-1">
          <h2 className="text-[30px] font-black text-hn-ink leading-none tracking-tight">
            Welcome back<span className="text-hn-accent">.</span>
          </h2>
          <p className="text-hn-mute text-sm font-semibold mt-2">
            Find your next restroom, without the stress.
          </p>
        </div>

        <Field
          id="login-email"
          label="Email"
          icon={<Mail size={12} />}
          error={errors.email}
        >
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@kmitl.ac.th"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-err" : undefined}
            className={inputCls}
          />
        </Field>

        <Field
          id="login-pw"
          label="Password"
          icon={<Lock size={12} />}
          error={errors.password}
        >
          <div className="flex items-center gap-2">
            <input
              id="login-pw"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Anything works in the demo"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-pw-err" : undefined}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="text-hn-mute p-1 -m-1"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-xs font-bold text-hn-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-[#E35205]"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() =>
              setNotice(
                "Simulated: a real app would email a reset link. Nothing is sent from this prototype.",
              )
            }
            className="text-xs font-black text-hn-accent underline underline-offset-2"
          >
            Forgot password?
          </button>
        </div>

        {notice && (
          <p
            role="status"
            className="text-xs font-bold text-hn-ink bg-hn-soft border-2 border-dashed border-hn-line rounded-xl p-3 hn-fade"
          >
            {notice}
          </p>
        )}

        <Btn type="submit" disabled={busy} className="w-full py-3.5 mt-1">
          {busy ? "Signing in…" : "Sign In →"}
        </Btn>
        <Btn
          variant="light"
          onClick={signInDemo}
          disabled={busy}
          className="w-full"
        >
          Use demo account
        </Btn>

        <p className="text-[11px] text-hn-mute font-semibold text-center leading-relaxed mt-2">
          Prototype sign-in: this is a <b>simulated</b> login. No account is
          verified and nothing leaves your browser, so please don't enter a
          real password.
        </p>
      </form>
    </div>
  );
}
