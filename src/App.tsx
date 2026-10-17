import { useState, type ReactNode } from "react";

type IconName =
  | "home"
  | "scan"
  | "calendar"
  | "garden"
  | "profile"
  | "heart"
  | "comment"
  | "send"
  | "bookmark"
  | "bell"
  | "plus"
  | "chevron"
  | "close"
  | "flash"
  | "image"
  | "check"
  | "droplet"
  | "sun"
  | "sprout"
  | "clock"
  | "map"
  | "settings";

const photos = {
  garden:
    "https://images.unsplash.com/photo-1651827684507-12e7c6675ea3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
  balcony:
    "https://images.unsplash.com/photo-1681103363236-fdbb1237bcc5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
  plants:
    "https://images.unsplash.com/photo-1682446904355-00bdf71c1614?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
  pots:
    "https://images.unsplash.com/photo-1655623454749-0a90b1f514fc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
};

function Icon({ name, size = 22, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 10.8 12 3l9 7.8" /><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" /></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 15c5.5.4 8-2.2 8-7-4.8 0-7.4 2.5-8 7Z" /><path d="M8 16c1-3 3-5 6-6.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3" /></>,
    garden: <><path d="M4 20V9l8-5 8 5v11H4Z" /><path d="M8 20v-5h8v5M12 15V8" /><path d="M12 11c-2.8 0-4-1.2-4-3.5 2.7 0 4 1.2 4 3.5ZM12 13c2.8 0 4-1.2 4-3.5-2.7 0-4 1.2-4 3.5Z" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.6-4.3 3.3-6.5 8-6.5s7.4 2.2 8 6.5" /></>,
    heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    comment: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-4-.9l-5 1.5 1.6-4.7a8.5 8.5 0 1 1 16.4-4.3Z" />,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
    bookmark: <path d="M5 3h14v19l-7-4-7 4V3Z" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    flash: <path d="m13 2-9 12h7l-1 8 10-13h-7V2Z" />,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    droplet: <path d="M12 2S5.5 9.2 5.5 14.3a6.5 6.5 0 0 0 13 0C18.5 9.2 12 2 12 2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    sprout: <><path d="M12 22V11" /><path d="M12 14C7 14 4 11.5 4 7c5 0 8 2.5 8 7ZM12 11c4.5 0 7-2.3 7-6-4.5 0-7 2.2-7 6Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Z" /><path d="M8 3v15M16 6v15" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function IconButton({ icon, label, onClick, active = false }: { icon: IconName; label: string; onClick?: () => void; active?: boolean }) {
  return <button className={`icon-button ${active ? "active" : ""}`} onClick={onClick} aria-label={label}><Icon name={icon} filled={active && icon === "heart"} /></button>;
}

function Avatar({ image, name, size = "md" }: { image?: string; name: string; size?: "sm" | "md" | "lg" }) {
  return <div className={`avatar avatar-${size}`}>{image ? <img src={image} alt="" /> : <span>{name.slice(0, 2).toUpperCase()}</span>}</div>;
}

function PlantMark({ type = "leaf", className = "" }: { type?: "leaf" | "flower" | "herb"; className?: string }) {
  return <div className={`plant-mark ${type} ${className}`}><span /><span /><i /></div>;
}

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [level, setLevel] = useState<"Începător" | "Experimentat">("Începător");
  return (
    <div className="onboarding">
      <div className="onboarding-photo">
        <img src={photos.plants} alt="Colecție luminoasă de plante de interior" />
        <div className="brand-pill"><Icon name="sprout" size={18} /> Sprout</div>
      </div>
      <div className="onboarding-content">
        <div className="eyebrow">Grădina ta, mereu aproape</div>
        <div className="display-title">Crește plante.<br />Cunoaște oameni.</div>
        <p className="muted">Îngrijire ghidată, inspirație zilnică și o comunitate care crește împreună cu tine.</p>
        <div className="level-label">Cum te descrii?</div>
        <div className="level-grid">
          {(["Începător", "Experimentat"] as const).map((item, index) => (
            <button className={`level-card ${level === item ? "selected" : ""}`} onClick={() => setLevel(item)} key={item}>
              <span className="level-icon"><Icon name={index ? "sprout" : "sun"} size={21} /></span>
              <strong>{item}</strong>
              <small>{index ? "Am deja rădăcini" : "Pornesc de la zero"}</small>
              <span className="select-dot">{level === item && <Icon name="check" size={13} />}</span>
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={onComplete}>Începe să crești <Icon name="chevron" size={18} /></button>
        <p className="fine-print">Prin continuare accepți termenii comunității Sprout.</p>
      </div>
    </div>
  );
}

const stories = [
  { name: "Grădina ta", own: true, image: photos.pots },
  { name: "Mara", image: photos.balcony },
  { name: "Andrei", image: photos.garden },
  { name: "Ioana", image: photos.plants },
  { name: "Radu", image: photos.pots },
];

function Feed() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="screen">
      <header className="topbar">
        <div className="wordmark"><span><Icon name="sprout" size={20} /></span>sprout.</div>
        <div className="top-actions"><IconButton icon="plus" label="Adaugă postare" /><IconButton icon="bell" label="Notificări" /></div>
      </header>
      <div className="stories">
        {stories.map((story) => (
          <div className="story" key={story.name}>
            <div className={`story-ring ${story.own ? "own" : ""}`}><Avatar image={story.image} name={story.name} /></div>
            <small>{story.name}</small>
          </div>
        ))}
      </div>
      <div className="feed-filter"><strong>Din comunitate</strong><button>În apropiere <Icon name="chevron" size={14} /></button></div>
      <article className="post-card">
        <div className="post-author">
          <Avatar image={photos.balcony} name="Mara" size="sm" />
          <div><strong>Mara Ionescu</strong><span>Cluj-Napoca · acum 24 min</span></div>
          <button className="more-button" aria-label="Mai multe opțiuni">•••</button>
        </div>
        <div className="post-image">
          <img src={photos.garden} alt="Strat urban bogat cu plante verzi" />
          <div className="plant-tag"><span /> Busuioc Genovese</div>
          <div className="image-count">1 / 3</div>
        </div>
        <div className="engagement-row">
          <div>
            <IconButton icon="heart" label="Apreciază" active={liked} onClick={() => setLiked(!liked)} />
            <IconButton icon="comment" label="Comentează" />
            <IconButton icon="send" label="Distribuie" />
          </div>
          <IconButton icon="bookmark" label="Salvează" active={saved} onClick={() => setSaved(!saved)} />
        </div>
        <div className="post-copy">
          <strong>{liked ? "1.249" : "1.248"} aprecieri</strong>
          <p><b>mara.creste</b> Prima recoltă de busuioc de pe balcon! Lumina de dimineață chiar a făcut diferența.</p>
          <div className="chips"><span>#grădinăurbană</span><span>#busuioc</span><span>#recoltă</span></div>
          <button className="comments-link">Vezi toate cele 36 de comentarii</button>
        </div>
      </article>
    </div>
  );
}

function Scanner({ onClose }: { onClose: () => void }) {
  const [result, setResult] = useState(false);
  return (
    <div className="scanner-screen">
      <img className="scanner-bg" src={photos.pots} alt="Plante pregătite pentru scanare" />
      <div className="scanner-shade" />
      <div className="scanner-header">
        <IconButton icon="close" label="Închide scannerul" onClick={onClose} />
        <strong>{result ? "Rezultat scanare" : "Identifică planta"}</strong>
        <IconButton icon="flash" label="Activează blițul" />
      </div>
      {!result ? (
        <>
          <div className="scan-frame"><i /><i /><i /><i /><div className="scan-line" /></div>
          <div className="scan-helper">Încadrează o frunză în zona marcată</div>
          <div className="scanner-controls">
            <IconButton icon="image" label="Alege din galerie" />
            <button className="shutter" onClick={() => setResult(true)} aria-label="Scanează planta"><span /></button>
            <div className="accuracy"><b>98%</b><small>precizie</small></div>
          </div>
        </>
      ) : (
        <div className="result-card">
          <div className="result-handle" />
          <div className="result-title">
            <div><span className="success-label"><Icon name="check" size={13} /> Identificare reușită</span><h2>Busuioc dulce</h2><em>Ocimum basilicum</em></div>
            <div className="confidence">98<small>%</small></div>
          </div>
          <div className="care-stats">
            <div><Icon name="sun" /><span><b>Lumină</b><small>6–8 ore</small></span></div>
            <div><Icon name="droplet" /><span><b>Apă</b><small>la 3 zile</small></span></div>
            <div><Icon name="sprout" /><span><b>Nivel</b><small>ușor</small></span></div>
          </div>
          <div className="health-card"><span className="health-icon"><Icon name="check" /></span><div><b>Planta pare sănătoasă</b><small>Nu am detectat dăunători sau boli.</small></div></div>
          <div className="tip-card"><b>Sfat pentru azi</b><p>Ciupirea vârfurilor încurajează ramificarea și o recoltă mai bogată.</p></div>
          <button className="primary-button" onClick={onClose}><Icon name="plus" size={18} /> Adaugă în grădina mea</button>
        </div>
      )}
    </div>
  );
}

const taskSeed = [
  { plant: "Monstera", task: "Udare moderată", time: "08:30", kind: "droplet" as IconName, done: true },
  { plant: "Roșii cherry", task: "Fertilizare", time: "18:00", kind: "sprout" as IconName, done: false },
  { plant: "Lavandă", task: "Verifică solul", time: "19:15", kind: "sun" as IconName, done: false },
];

function CalendarScreen() {
  const [tasks, setTasks] = useState(taskSeed);
  const dates = [
    ["L", "12"], ["M", "13"], ["M", "14"], ["J", "15"], ["V", "16"], ["S", "17"], ["D", "18"],
  ];
  return (
    <div className="screen padded-screen">
      <header className="section-header"><div><span className="eyebrow">Tracker de îngrijire</span><h1>Mai 2025</h1></div><button className="today-button">Astăzi</button></header>
      <div className="week-strip">
        {dates.map(([day, date]) => <button key={date} className={date === "15" ? "active" : ""}><small>{day}</small><strong>{date}</strong>{date === "15" && <span />}</button>)}
      </div>
      <div className="progress-card">
        <div className="progress-copy"><span>Progresul de azi</span><strong>1 din 3 sarcini</strong></div>
        <div className="progress-ring"><span>33%</span></div>
      </div>
      <div className="list-heading"><div><h2>Planul de azi</h2><span>3 activități</span></div><button><Icon name="plus" size={17} /> Adaugă</button></div>
      <div className="task-list">
        {tasks.map((task, index) => (
          <button className={`task-card ${task.done ? "done" : ""}`} key={task.plant} onClick={() => setTasks(tasks.map((item, i) => i === index ? { ...item, done: !item.done } : item))}>
            <span className="task-icon"><Icon name={task.kind} /></span>
            <span className="task-copy"><b>{task.plant}</b><small>{task.task}</small></span>
            <span className="task-time"><Icon name="clock" size={13} /> {task.time}</span>
            <span className="task-check">{task.done && <Icon name="check" size={14} />}</span>
          </button>
        ))}
      </div>
      <div className="care-note"><div className="note-leaf"><Icon name="sprout" /></div><div><b>Mic reminder</b><p>Udă plantele dimineața pentru a reduce evaporarea.</p></div></div>
    </div>
  );
}

function GardenScreen() {
  const [plants, setPlants] = useState([
    { type: "leaf" as const, name: "Monstera", x: 21, y: 25 },
    { type: "herb" as const, name: "Busuioc", x: 68, y: 22 },
    { type: "flower" as const, name: "Lavandă", x: 44, y: 63 },
  ]);
  const addPlant = (type: "leaf" | "flower" | "herb", name: string) => {
    if (plants.length < 6) setPlants([...plants, { type, name, x: 18 + ((plants.length * 23) % 65), y: 18 + ((plants.length * 19) % 65) }]);
  };
  return (
    <div className="screen padded-screen garden-screen">
      <header className="section-header"><div><span className="eyebrow">Planner vizual</span><h1>Balconul meu</h1></div><IconButton icon="settings" label="Setări grădină" /></header>
      <div className="garden-meta"><span><Icon name="map" size={15} /> 6 m²</span><span><Icon name="sun" size={15} /> Sud-est</span><button>Editează</button></div>
      <div className="garden-canvas">
        <div className="canvas-grid" />
        <div className="balcony-edge">BALUSTRADĂ · LUMINĂ DIRECTĂ</div>
        {plants.map((plant, index) => (
          <button className="placed-plant" key={`${plant.name}-${index}`} style={{ left: `${plant.x}%`, top: `${plant.y}%` }}>
            <PlantMark type={plant.type} />
            <span>{plant.name}</span>
          </button>
        ))}
        <div className="door-shape">UȘĂ</div>
      </div>
      <div className="planner-tip"><Icon name="sun" size={17} /><span>Zona de sus primește aproximativ <b>7 ore de lumină</b>.</span></div>
      <div className="plant-tray">
        <div className="list-heading"><div><h2>Adaugă o plantă</h2><span>Atinge pentru a plasa</span></div></div>
        <div className="plant-options">
          <button onClick={() => addPlant("herb", "Mentă")}><PlantMark type="herb" /><span>Mentă</span></button>
          <button onClick={() => addPlant("flower", "Mușcată")}><PlantMark type="flower" /><span>Mușcată</span></button>
          <button onClick={() => addPlant("leaf", "Ficus")}><PlantMark type="leaf" /><span>Ficus</span></button>
          <button className="add-empty"><Icon name="plus" /><span>Altele</span></button>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="screen padded-screen profile-screen">
      <header className="section-header"><div className="wordmark"><span><Icon name="sprout" size={20} /></span>sprout.</div><IconButton icon="settings" label="Setări profil" /></header>
      <div className="profile-intro">
        <Avatar image={photos.balcony} name="Alexandra" size="lg" />
        <div><h1>Alexandra</h1><span>Grădinar urban · Nivel 8</span><div className="profile-stats"><b>24 <small>plante</small></b><b>1.2k <small>prieteni</small></b></div></div>
      </div>
      <div className="achievement-card"><div className="achievement-icon"><Icon name="sprout" /></div><div><span>Realizare nouă</span><b>30 de zile de îngrijire</b></div><Icon name="chevron" /></div>
      <div className="profile-tabs"><button className="active">Pentru tine</button><button>Salvate</button><button>Postări</button></div>
      <section className="hub-section">
        <div className="list-heading"><div><h2>Evenimente</h2><span>În apropierea ta</span></div><button>Vezi toate</button></div>
        <article className="event-card">
          <img src={photos.garden} alt="Atelier într-o grădină urbană" />
          <div className="event-date"><b>24</b><small>MAI</small></div>
          <div className="event-copy"><span>Atelier practic</span><b>Grădina comestibilă pe balcon</b><small><Icon name="map" size={13} /> Grădina Botanică · 11:00</small></div>
        </article>
      </section>
      <section className="hub-section">
        <div className="list-heading"><div><h2>Sfatul expertului</h2><span>Ales pentru grădina ta</span></div></div>
        <article className="expert-card"><div className="expert-copy"><span>GHID · 5 MIN</span><b>De ce se îngălbenesc frunzele?</b><p>Învață să citești cele mai comune semnale ale plantelor tale.</p><button>Citește ghidul <Icon name="chevron" size={14} /></button></div><img src={photos.plants} alt="Frunze verzi sănătoase" /></article>
      </section>
    </div>
  );
}

function BottomNav({ active, onChange, onScan }: { active: string; onChange: (tab: string) => void; onScan: () => void }) {
  const tabs = [
    { id: "feed", icon: "home" as IconName, label: "Acasă" },
    { id: "calendar", icon: "calendar" as IconName, label: "Calendar" },
    { id: "scan", icon: "scan" as IconName, label: "Scanează" },
    { id: "garden", icon: "garden" as IconName, label: "Grădină" },
    { id: "profile", icon: "profile" as IconName, label: "Profil" },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => tab.id === "scan" ? (
        <button className="scan-nav" key={tab.id} onClick={onScan} aria-label={tab.label}><span><Icon name="scan" size={26} /></span><small>{tab.label}</small></button>
      ) : (
        <button className={active === tab.id ? "active" : ""} key={tab.id} onClick={() => onChange(tab.id)}><Icon name={tab.icon} filled={active === tab.id && tab.id === "profile"} /><small>{tab.label}</small></button>
      ))}
    </nav>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [active, setActive] = useState("feed");
  const [scanner, setScanner] = useState(false);

  const content = active === "calendar" ? <CalendarScreen /> : active === "garden" ? <GardenScreen /> : active === "profile" ? <ProfileScreen /> : <Feed />;

  return (
    <main className="app-stage">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="phone-shell">
        {!onboarded ? <Onboarding onComplete={() => setOnboarded(true)} /> : (
          <>
            <div className="app-content">{content}</div>
            <BottomNav active={active} onChange={setActive} onScan={() => setScanner(true)} />
            {scanner && <Scanner onClose={() => setScanner(false)} />}
          </>
        )}
      </div>
      <div className="desktop-note"><Icon name="sprout" size={18} /><span>Sprout · grădina care crește cu tine</span></div>
    </main>
  );
}
