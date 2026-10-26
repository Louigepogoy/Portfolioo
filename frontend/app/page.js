import Image from "next/image";
import { getPortfolio } from "../lib/api";
import StatusLoop from "../components/StatusLoop";
import ContactForm from "../components/ContactForm";
import DustVortex from "../components/DustVortex";
import ThemeToggle from "../components/ThemeToggle";
import { contactIcons, ArrowIcon, DownloadIcon } from "../components/Icons";

export default async function Home() {
  const data = await getPortfolio();
  const { profile, skills, projects } = data;
  const journey = data.journey || [];
  // Entries without a url (e.g. GitHub/Discord not filled in yet) stay hidden.
  const contacts = data.contacts.filter((c) => c.url);

  return (
    <>
      <DustVortex />
      <header className="nav">
        <div className="container nav__inner">
          <a href="#top" className="nav__logo">
            {profile.name}
            <span>.dev</span>
          </a>
          <nav className="nav__links">
            <a href="#about">About</a>
            {journey.length > 0 && <a href="#journey">Journey</a>}
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
          <StatusLoop />
          <ThemeToggle />
        </div>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero__text">
            {profile.available && <span className="pill">● Available for work</span>}
            <h1>
              Hi, I&apos;m <span className="gradient">{profile.name}</span>
              <br />
              {profile.role}
            </h1>
            <p className="lead">{profile.tagline}</p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#projects">See my work</a>
              <a className="btn btn--ghost" href="#contact">Contact me</a>
              {profile.cv && (
                <a className="btn btn--ghost" href={profile.cv} download>
                  <DownloadIcon /> Download CV
                </a>
              )}
            </div>
            <ul className="hero__socials">
              {contacts.map((c) => {
                const Icon = contactIcons[c.id] || contactIcons.website;
                return (
                  <li key={c.id}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" aria-label={c.label}>
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="hero__photo">
            <div className="hero__ring" />
            <Image src={profile.photo} alt={`Photo of ${profile.name}`} width={420} height={560} priority />
          </div>
        </section>

        <section id="about" className="section container">
          <p className="eyebrow">About me</p>
          <h2>Building products end to end</h2>
          <div className="about">
            <p className="about__text">{profile.about}</p>
            <div className="skills">
              {skills.map((s) => (
                <div key={s.group} className="skills__group">
                  <h3>{s.group}</h3>
                  <ul>
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {journey.length > 0 && (
          <section id="journey" className="section container">
            <p className="eyebrow">Journey</p>
            <h2>Experience &amp; education</h2>
            <ol className="timeline">
              {journey.map((j) => (
                <li key={`${j.title}-${j.period}`} className="timeline__item">
                  <span className="timeline__period">{j.period}</span>
                  <h3>{j.title}</h3>
                  <p className="timeline__place">{j.place}</p>
                  {j.description && <p>{j.description}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section id="projects" className="section container">
          <p className="eyebrow">Achievements</p>
          <h2>Projects I&apos;ve built</h2>
          <div className="projects">
            {projects.map((p) => (
              <article key={p.id} className="project">
                <div className="project__image">
                  <Image src={p.image} alt={`${p.title} screenshot`} width={1440} height={775} />
                  <span className={`project__status ${p.status === "Live" ? "is-live" : ""}`}>{p.status}</span>
                </div>
                <div className="project__body">
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <ul className="project__highlights">
                    {p.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <div className="project__footer">
                    <div className="tags">
                      {p.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    {p.url && (
                      <a className="btn btn--small" href={p.url} target="_blank" rel="noopener noreferrer">
                        Visit site <ArrowIcon />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section container">
          <p className="eyebrow">Contact</p>
          <h2>Let&apos;s work together</h2>
          <div className="contact">
            <div className="contact__links">
              <p className="lead">Have a project, job offer, or just want to say hi? Reach me on any of these or send a message here.</p>
              {contacts.map((c) => {
                const Icon = contactIcons[c.id] || contactIcons.website;
                return (
                  <a key={c.id} className={`contact__card contact__card--${c.id}`} href={c.url} target="_blank" rel="noopener noreferrer">
                    <span className="contact__icon">
                      <Icon />
                    </span>
                    <span>
                      <strong>{c.label}</strong>
                      <small>{c.value}</small>
                    </span>
                    <ArrowIcon />
                  </a>
                );
              })}
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="footer container">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with Next.js, React &amp; Express.
        </p>
      </footer>
    </>
  );
}
