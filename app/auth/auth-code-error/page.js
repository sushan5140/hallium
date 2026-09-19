export const metadata = {
  title: "Google sign-in error",
};

export default function AuthCodeErrorPage() {
  return (
    <main className="authErrorPage">
      <section className="authErrorCard">
        <span className="eyebrow">Hallim · Google sign-in</span>
        <h1>Google sign-in could not be completed.</h1>
        <p>Return to Hallim and try again. Hallim uses Google sign-in only for learner access.</p>
        <a href="/">Return to Hallim →</a>
      </section>
    </main>
  );
}
