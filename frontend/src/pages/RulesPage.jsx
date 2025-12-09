export default function RulesPage() {
  return (
    <div className="panel">
      <h1 className="page-title">Rules</h1>
      <section>
        <h2 className="mt-0">How It Works</h2>
        <ol>
          <li>Every row must contain the digits 1–9 exactly once. (for easy mode: digits 1–6)</li>
          <li>Every column must contain the digits 1–9 exactly once. (for easy mode: digits 1–6)</li>
          <li>Each 3×3 subgrid must also contain the digits 1–9 exactly once. (for easy mode: 3×2 subgrid and digits 1–6)</li>
          <li>Use logic patterns (singles, pairs, pointing sets, etc.) to eliminate candidates.</li>
          <li>No guessing needed—only place a number when you can prove it belongs.</li>
        </ol>
      </section>

      <section>
        <h2>Credits</h2>
        <p>Made by Qing Wen and Yuwei Ma.</p>
        <div className="credits-grid">
          <article className="member-card">
            <h3>Qing Wen</h3>
            <ul className="contact-links">
              <li>
                <a
                  href="mailto:wen.qing1@northeastern.edu"
                  className="contact-link"
                  aria-label="Email Qing Wen"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4.5 5.75h15a1.25 1.25 0 011.25 1.25v10a1.25 1.25 0 01-1.25 1.25h-15A1.25 1.25 0 013.25 17V7a1.25 1.25 0 011.25-1.25z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 7l7 5.25L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Heyolivia709"
                  className="contact-link"
                  aria-label="View Qing Wen GitHub profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 2.5c-5.25 0-9.5 4.27-9.5 9.53 0 4.21 2.74 7.78 6.54 9.05.48.09.66-.21.66-.47 0-.23-.01-.84-.01-1.64-2.66.59-3.22-1.29-3.22-1.29-.44-1.14-1.08-1.44-1.08-1.44-.88-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.28 1.08 2.84.82.09-.65.34-1.08.62-1.33-2.13-.25-4.38-1.09-4.38-4.83 0-1.07.37-1.95.98-2.63-.1-.25-.43-1.25.09-2.6 0 0 .81-.26 2.66.99a9.2 9.2 0 014.83 0c1.84-1.25 2.65-.99 2.65-.99.53 1.35.2 2.35.1 2.6.61.68.97 1.56.97 2.63 0 3.75-2.26 4.57-4.41 4.82.35.31.67.93.67 1.88 0 1.35-.01 2.44-.01 2.77 0 .26.18.57.67.47 3.79-1.27 6.53-4.84 6.53-9.05C21.5 6.77 17.25 2.5 12 2.5z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/qing-olivia-wen/"
                  className="contact-link"
                  aria-label="View Qing Wen LinkedIn profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6.75 9h2.5v8.5h-2.5zM8 6.5a1.5 1.5 0 11-2.998.001A1.5 1.5 0 018 6.5zM10.75 9h2.38v1.17h.03c.33-.62 1.14-1.27 2.35-1.27 2.51 0 2.97 1.65 2.97 3.8v4.8h-2.5v-4.26c0-1.02-.02-2.33-1.42-2.33-1.42 0-1.63 1.11-1.63 2.26v4.33h-2.5z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </article>
          <article className="member-card">
            <h3>Yuwei Ma</h3>
            <ul className="contact-links">
              <li>
                <a
                  href="mailto:ma.yuwe@northeastern.edu"
                  className="contact-link"
                  aria-label="Email Yuwei Ma"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M4.5 5.75h15a1.25 1.25 0 011.25 1.25v10a1.25 1.25 0 01-1.25 1.25h-15A1.25 1.25 0 013.25 17V7a1.25 1.25 0 011.25-1.25z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 7l7 5.25L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/vivianinmay"
                  className="contact-link"
                  aria-label="View Yuwei Ma GitHub profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 2.5c-5.25 0-9.5 4.27-9.5 9.53 0 4.21 2.74 7.78 6.54 9.05.48.09.66-.21.66-.47 0-.23-.01-.84-.01-1.64-2.66.59-3.22-1.29-3.22-1.29-.44-1.14-1.08-1.44-1.08-1.44-.88-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.28 1.08 2.84.82.09-.65.34-1.08.62-1.33-2.13-.25-4.38-1.09-4.38-4.83 0-1.07.37-1.95.98-2.63-.1-.25-.43-1.25.09-2.6 0 0 .81-.26 2.66.99a9.2 9.2 0 014.83 0c1.84-1.25 2.65-.99 2.65-.99.53 1.35.2 2.35.1 2.6.61.68.97 1.56.97 2.63 0 3.75-2.26 4.57-4.41 4.82.35.31.67.93.67 1.88 0 1.35-.01 2.44-.01 2.77 0 .26.18.57.67.47 3.79-1.27 6.53-4.84 6.53-9.05C21.5 6.77 17.25 2.5 12 2.5z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/vivian-ma-7070252b2/"
                  className="contact-link"
                  aria-label="View Yuwei Ma LinkedIn profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6.75 9h2.5v8.5h-2.5zM8 6.5a1.5 1.5 0 11-2.998.001A1.5 1.5 0 018 6.5zM10.75 9h2.38v1.17h.03c.33-.62 1.14-1.27 2.35-1.27 2.51 0 2.97 1.65 2.97 3.8v4.8h-2.5v-4.26c0-1.02-.02-2.33-1.42-2.33-1.42 0-1.63 1.11-1.63 2.26v4.33h-2.5z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </article>
        </div>
        <p className="muted">Kitten Sudoku React Edition · Academic project extension</p>
      </section>
    </div>
  );
}
