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
  | "leaf"
  | "crown"
  | "sun"
  | "sprout"
  | "clock"
  | "map"
  | "settings"
  | "search";

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
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c3-5 7-8 12-11" /></>,
    crown: <><path d="m2 8 5 4 5-7 5 7 5-4-2 12H4L2 8Z" /><path d="M4 17h16" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    sprout: <><path d="M12 22V11" /><path d="M12 14C7 14 4 11.5 4 7c5 0 8 2.5 8 7ZM12 11c4.5 0 7-2.3 7-6-4.5 0-7 2.2-7 6Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Z" /><path d="M8 3v15M16 6v15" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
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

function PlantObject({ type = "leaf", selected = false }: { type?: "leaf" | "flower" | "herb"; selected?: boolean }) {
  const flowerPetals = type === "flower" ? (
    <>
      <span className="petal petal-a" />
      <span className="petal petal-b" />
      <span className="petal petal-c" />
      <span className="petal petal-d" />
      <span className="flower-core" />
    </>
  ) : null;

  return (
    <div className={`plant-3d plant-3d--${type} ${selected ? "selected" : ""}`} aria-hidden="true">
      <span className="stem" />
      <span className="leaf leaf-a" />
      <span className="leaf leaf-b" />
      <span className="leaf leaf-c" />
      {flowerPetals}
    </div>
  );
}

function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [level, setLevel] = useState<"Gratuit" | "Premium">("Gratuit");
  return (
    <div className="onboarding">
      <div className="onboarding-photo">
        <img src={photos.plants} alt="Colecție luminoasă de plante de interior" />
        <div className="brand-pill"><img src="/rod.jpeg?v=2" alt="" /> rod</div>
      </div>
      <div className="onboarding-content">
        <div className="eyebrow">Grădina ta, mereu aproape</div>
        <div className="display-title">Crește plante.<br />Cunoaște oameni.</div>
        <p className="muted">Îngrijire ghidată, inspirație zilnică și o comunitate care crește împreună cu tine.</p>
        <div className="level-label">Alege planul tău</div>
        <div className="level-grid">
          {(["Gratuit", "Premium"] as const).map((item, index) => (
            <button className={`level-card ${level === item ? "selected" : ""}`} onClick={() => setLevel(item)} key={item}>
              <span className="level-icon"><Icon name={index ? "crown" : "leaf"} size={21} /></span>
              <strong>{item}</strong>
              <small>{index ? "Funcții premium" : "Planul de bază"}</small>
              <span className="select-dot">{level === item && <Icon name="check" size={13} />}</span>
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={onComplete}>Începe să crești <Icon name="chevron" size={18} /></button>
        <p className="fine-print">Prin continuare accepți termenii comunității rod.</p>
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

function Feed({ onNavigate, onScan }: { onNavigate: (tab: string) => void; onScan: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="screen">
      <header className="topbar">
        <div className="wordmark"><img src="/rod.jpeg?v=2" alt="" />rod</div>
        <div className="top-actions"><IconButton icon="scan" label="Scanează o plantă" onClick={onScan} /><button className="header-avatar" onClick={() => onNavigate("profile")} aria-label="Deschide profilul"><Avatar image={photos.balcony} name="Alexandra" size="sm" /></button></div>
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
      <div className="community-shortcuts" aria-label="Explorează comunitatea">
        <button onClick={() => onNavigate("chat")}><span className="shortcut-icon chat-shortcut"><Icon name="comment" size={17} /></span><b>Chat</b><small>Comunitatea</small></button>
        <button onClick={() => onNavigate("events")}><span className="shortcut-icon event-shortcut"><Icon name="map" size={17} /></span><b>Evenimente</b><small>Împreună afară</small></button>
        <button onClick={() => onNavigate("tips")}><span className="shortcut-icon tip-shortcut"><Icon name="sprout" size={17} /></span><b>Sfaturi</b><small>Crește frumos</small></button>
        <button onClick={() => onNavigate("garden")}><span className="shortcut-icon garden-shortcut"><Icon name="garden" size={17} /></span><b>Grădina mea</b><small>Plantele tale</small></button>
      </div>
      <article className="post-card">
        <div className="post-author">
          <Avatar image={photos.balcony} name="Mara" size="sm" />
          <div><strong>Mara Ionescu</strong><span>Iași · acum 24 min</span></div>
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

type Conversation = { id: string; name: string; image: string; preview: string; time: string; unread: number; online?: boolean };

const conversations: Conversation[] = [
  { id: "mara", name: "Mara Ionescu", image: photos.balcony, preview: "Mulțumesc pentru sfat! 🌿", time: "acum", unread: 2, online: true },
  { id: "community", name: "Grădinari din Iași", image: "/rod.jpeg?v=2", preview: "Andrei: Ne vedem sâmbătă?", time: "10:42", unread: 4 },
  { id: "ioana", name: "Ioana Pop", image: photos.plants, preview: "Ți-am trimis poze cu răsadurile", time: "ieri", unread: 0, online: true },
  { id: "radu", name: "Radu Marin", image: photos.pots, preview: "Super, spor la grădinărit!", time: "ieri", unread: 0 },
];

function ChatScreen() {
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Record<string, string[]>>({
    mara: ["Bună! Am văzut busuiocul tău, arată minunat 🌱", "Mulțumesc! L-am pus lângă fereastră, cu soare dimineața."],
    community: ["Bine ați venit în grupul grădinarilor din Iași! 🌿", "Andrei: Ne vedem sâmbătă la schimbul de răsaduri?"],
    ioana: ["Ți-am trimis poze cu răsadurile mele", "Ce frumoase sunt! Ce soi de roșii ai ales?"],
    radu: ["Super, spor la grădinărit!"],
  });

  const sendMessage = () => {
    const message = draft.trim();
    if (!message || !activeChat) return;
    setMessages((current) => ({ ...current, [activeChat.id]: [...(current[activeChat.id] ?? []), message] }));
    setDraft("");
  };

  if (activeChat) {
    return (
      <div className="screen chat-screen">
        <header className="chat-header">
          <button className="back-button" onClick={() => setActiveChat(null)} aria-label="Înapoi la conversații">‹</button>
          <Avatar image={activeChat.image} name={activeChat.name} size="sm" />
          <div className="chat-contact"><b>{activeChat.name}</b><small>{activeChat.online ? "Activă acum" : "Comunitatea rod"}</small></div>
          <IconButton icon="settings" label="Opțiuni conversație" />
        </header>
        <div className="chat-messages">
          <div className="chat-day">ASTĂZI</div>
          {(messages[activeChat.id] ?? []).map((message, index) => (
            <div className={`chat-bubble ${index === (messages[activeChat.id]?.length ?? 0) - 1 ? "mine" : ""}`} key={`${message}-${index}`}>{message}<small>{index === (messages[activeChat.id]?.length ?? 0) - 1 ? "acum" : "10:24"}</small></div>
          ))}
          <div className="typing-indicator"><span /><span /><span /> Mara scrie</div>
        </div>
        <div className="chat-composer">
          <input aria-label="Scrie un mesaj" placeholder="Scrie un mesaj..." value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} />
          <button onClick={sendMessage} aria-label="Trimite mesajul" disabled={!draft.trim()}><Icon name="send" size={18} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen padded-screen chat-list-screen">
      <header className="section-header"><div><span className="eyebrow">Comunitatea rod</span><h1>Mesaje</h1></div><button className="new-chat-button" aria-label="Conversație nouă"><Icon name="plus" size={19} /></button></header>
      <label className="chat-search"><Icon name="search" size={17} /><input aria-label="Caută conversații" placeholder="Caută prieteni sau grupuri" /></label>
      <button className="community-chat-card" onClick={() => setActiveChat(conversations[1])}>
        <img className="community-chat-icon" src="/rod.jpeg?v=2" alt="" />
        <span><b>Grupul grădinarilor</b><small>Schimbăm idei, plante și bucurii</small></span>
        <Icon name="chevron" size={18} />
      </button>
      <div className="list-heading chat-list-heading"><div><h2>Conversațiile tale</h2><span>O comunitate mereu aproape</span></div></div>
      <div className="conversation-list">
        {conversations.map((conversation) => {
          const conversationMessages = messages[conversation.id] ?? [];
          const latest = conversationMessages[conversationMessages.length - 1] ?? conversation.preview;
          return (
            <button className="conversation-row" key={conversation.id} onClick={() => setActiveChat(conversation)}>
              <span className="conversation-avatar"><Avatar image={conversation.image} name={conversation.name} /><i className={conversation.online ? "online" : ""} /></span>
              <span className="conversation-copy"><b>{conversation.name}</b><small>{latest}</small></span>
              <span className="conversation-meta"><small>{conversation.time}</small>{conversation.unread > 0 && <i>{conversation.unread}</i>}</span>
            </button>
          );
        })}
      </div>
      <div className="chat-prompt"><Icon name="heart" size={17} /><span>Un sfat bun crește și mai frumos când e împărtășit.</span></div>
    </div>
  );
}

type GardenEvent = { id: string; day: string; month: string; category: string; title: string; location: string; time: string; image: string; attendees: string };

const gardenEvents: GardenEvent[] = [
  { id: "balcony", day: "24", month: "OCT", category: "Atelier", title: "Grădină comestibilă pe balcon", location: "Grădina Botanică", time: "11:00 – 13:00", image: photos.garden, attendees: "18 grădinari participă" },
  { id: "seedlings", day: "01", month: "NOV", category: "Comunitate", title: "Schimb de semințe și răsaduri", location: "Casa de Cultură a Studenților", time: "10:30 – 12:30", image: photos.pots, attendees: "12 grădinari participă" },
  { id: "herbs", day: "07", month: "NOV", category: "Tur ghidat", title: "Plante aromatice pentru sezonul rece", location: "Sera comunitară", time: "15:00 – 16:30", image: photos.plants, attendees: "9 grădinari participă" },
];

function EventsScreen() {
  const [category, setCategory] = useState("Toate");
  const [joined, setJoined] = useState<string[]>([]);
  const filters = ["Toate", "Atelier", "Comunitate", "Tur ghidat"];
  const filteredEvents = category === "Toate" ? gardenEvents : gardenEvents.filter((event) => event.category === category);
  return (
    <div className="screen padded-screen events-screen">
      <header className="section-header"><div><span className="eyebrow">Creștem împreună</span><h1>Evenimente</h1></div><span className="location-pill"><Icon name="map" size={14} /> Iași</span></header>
      <div className="events-intro"><span className="events-sparkle"><Icon name="sprout" size={24} /></span><div><b>Ieșim la grădinărit?</b><small>Descoperă oameni și idei noi, chiar lângă tine.</small></div></div>
      <div className="event-filters" aria-label="Filtrează evenimentele">
        {filters.map((filter) => <button className={category === filter ? "active" : ""} key={filter} onClick={() => setCategory(filter)}>{filter}</button>)}
      </div>
      <div className="events-list">
        {filteredEvents.map((event) => {
          const attending = joined.includes(event.id);
          return (
            <article className="event-full-card" key={event.id}>
              <div className="event-cover"><img src={event.image} alt="" /><span className="event-category">{event.category}</span><div className="event-date event-date-card"><b>{event.day}</b><small>{event.month}</small></div></div>
              <div className="event-detail">
                <h2>{event.title}</h2>
                <span><Icon name="map" size={14} /> {event.location}</span>
                <span><Icon name="clock" size={14} /> {event.time}</span>
                <div className="event-bottom"><small>{event.attendees}</small><button className={attending ? "joined" : ""} onClick={() => setJoined((current) => attending ? current.filter((id) => id !== event.id) : [...current, event.id])}>{attending ? "Participi ✓" : "Participă"}</button></div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="event-host-card"><span><Icon name="plus" size={19} /></span><div><b>Ai o idee de eveniment?</b><small>Adună comunitatea în jurul unei plante.</small></div><button aria-label="Propune un eveniment"><Icon name="chevron" size={17} /></button></div>
    </div>
  );
}

type GardenTip = { id: string; category: string; title: string; summary: string; readTime: string; image: string; body: string };

const gardenTips: GardenTip[] = [
  { id: "yellow-leaves", category: "Plante de interior", title: "De ce se îngălbenesc frunzele?", summary: "Învață să citești semnalele pe care ți le transmit plantele.", readTime: "5 min", image: photos.plants, body: "Frunzele galbene pot semnala prea multă apă, prea puțină lumină sau un ghiveci fără drenaj. Verifică solul cu degetul înainte de următoarea udare și asigură-te că apa se poate scurge ușor. Îndepărtează frunzele afectate doar după ce ai identificat cauza." },
  { id: "watering", category: "Îngrijire", title: "Udarea corectă, fără ghicitori", summary: "Un test simplu al solului te ajută să găsești ritmul potrivit.", readTime: "3 min", image: photos.balcony, body: "Introdu un deget la aproximativ doi centimetri în sol. Dacă pământul este încă umed, mai așteaptă; dacă este uscat, udă lent până când puțină apă apare în farfurioară. Dimineața este un moment bun, fiindcă planta are timp să folosească apa pe parcursul zilei." },
  { id: "herbs", category: "Grădină urbană", title: "Busuioc bogat chiar și pe balcon", summary: "Câteva obiceiuri mici înseamnă frunze proaspete toată vara.", readTime: "4 min", image: photos.garden, body: "Așază busuiocul într-un loc cu cel puțin șase ore de lumină și rotește ghiveciul din când în când. Ciupirea vârfurilor deasupra unei perechi de frunze încurajează ramificarea. Recoltează regulat, dar nu lua mai mult de o treime din plantă odată." },
  { id: "repotting", category: "Îngrijire", title: "Când e momentul să schimbi ghiveciul?", summary: "Semne ușor de recunoscut că rădăcinile au nevoie de spațiu.", readTime: "6 min", image: photos.pots, body: "Rădăcini care ies prin găurile de drenaj, solul care se usucă neobișnuit de repede sau creșterea încetinită pot indica nevoia de repotare. Alege un ghiveci cu doar câțiva centimetri mai mare și folosește un substrat potrivit plantei." },
];

function TipsScreen() {
  const [category, setCategory] = useState("Toate");
  const [search, setSearch] = useState("");
  const [activeTip, setActiveTip] = useState<GardenTip | null>(null);
  const [savedTips, setSavedTips] = useState<string[]>([]);
  const categories = ["Toate", "Îngrijire", "Plante de interior", "Grădină urbană"];
  const visibleTips = gardenTips.filter((tip) => {
    const matchesCategory = category === "Toate" || tip.category === category;
    const matchesSearch = `${tip.title} ${tip.summary} ${tip.category}`.toLocaleLowerCase("ro").includes(search.toLocaleLowerCase("ro"));
    return matchesCategory && matchesSearch;
  });

  if (activeTip) {
    const isSaved = savedTips.includes(activeTip.id);
    return (
      <div className="screen padded-screen tip-detail-screen">
        <button className="text-back-button" onClick={() => setActiveTip(null)}>‹ Toate sfaturile</button>
        <img className="tip-detail-image" src={activeTip.image} alt="" />
        <span className="tip-category-label">{activeTip.category} · {activeTip.readTime} de citit</span>
        <h1>{activeTip.title}</h1>
        <p className="tip-detail-summary">{activeTip.summary}</p>
        <p className="tip-detail-body">{activeTip.body}</p>
        <div className="tip-expert-note"><Icon name="sprout" size={19} /><span><b>Un mic reminder</b>Fiecare plantă are ritmul ei. Observ-o înainte să-i schimbi rutina.</span></div>
        <button className={`save-tip-button ${isSaved ? "saved" : ""}`} onClick={() => setSavedTips((current) => isSaved ? current.filter((id) => id !== activeTip.id) : [...current, activeTip.id])}><Icon name="bookmark" size={17} />{isSaved ? "Salvat la favorite" : "Salvează sfatul"}</button>
      </div>
    );
  }

  return (
    <div className="screen padded-screen tips-screen">
      <header className="section-header"><div><span className="eyebrow">Puțină grijă, multă verdeață</span><h1>Sfaturi de grădinărit</h1></div><span className="tip-header-mark"><Icon name="sprout" size={21} /></span></header>
      <label className="tip-search"><Icon name="search" size={17} /><input aria-label="Caută sfaturi" placeholder="Caută o plantă sau un subiect" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div className="tip-categories" aria-label="Categorii de sfaturi">
        {categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="tip-feature-card" onClick={() => setActiveTip(gardenTips[0])} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setActiveTip(gardenTips[0]); }}>
        <img src={photos.plants} alt="" /><div className="tip-feature-shade" /><span className="tip-feature-content"><small>Sfatul săptămânii</small><b>Frunze sănătoase,<br />plantă fericită</b><span>Descoperă ghidul <Icon name="chevron" size={14} /></span></span>
      </div>
      <div className="list-heading tips-list-heading"><div><h2>Idei pentru grădina ta</h2><span>{visibleTips.length} ghiduri de explorat</span></div></div>
      <div className="tip-list">
        {visibleTips.map((tip) => (
          <button className="tip-row" key={tip.id} onClick={() => setActiveTip(tip)}>
            <img src={tip.image} alt="" /><span className="tip-row-copy"><small>{tip.category} · {tip.readTime}</small><b>{tip.title}</b><span>{tip.summary}</span></span><Icon name="chevron" size={18} />
          </button>
        ))}
        {visibleTips.length === 0 && <p className="empty-tips">Nu am găsit sfaturi pentru căutarea ta. Încearcă alt cuvânt. 🌱</p>}
      </div>
    </div>
  );
}

function Scanner({ onClose, onAdd }: { onClose: () => void; onAdd: (plant: ScannedPlant) => void }) {
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
          <button className="primary-button" onClick={() => onAdd({ id: `plant-${Date.now()}`, name: "Busuioc dulce", type: "herb", stage: "seedling", progress: 24, thirsty: false })}><Icon name="plus" size={18} /> Adaugă în grădina mea</button>
        </div>
      )}
    </div>
  );
}

type ScannedPlant = { id: string; name: string; type: "leaf" | "flower" | "herb"; stage: "seedling" | "blooming" | "mature"; progress: number; thirsty: boolean };

const taskSeed = [
  { plant: "Monstera", task: "Udare moderată", time: "08:30", kind: "droplet" as IconName, done: true },
  { plant: "Busuioc", task: "Fertilizare", time: "18:00", kind: "sprout" as IconName, done: false },
  { plant: "Lavandă", task: "Tunde florile uscate", time: "19:15", kind: "sun" as IconName, done: false },
];

function CalendarScreen({ carePlans, onOpenPlant, showUpgradePromptOnOpen, onDismissUpgradePrompt }: { carePlans: ScannedPlant[]; onOpenPlant: (plantId: string) => void; showUpgradePromptOnOpen: boolean; onDismissUpgradePrompt: () => void }) {
  const [tasks, setTasks] = useState(taskSeed);
  const [completedPlanTasks, setCompletedPlanTasks] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState("17");
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const allTasks = [
    ...tasks.map((task, index) => ({ ...task, id: `task-${index}` })),
    ...carePlans.map((plant) => ({ id: plant.id, plant: plant.name, task: "Udare · verifică stratul superior de sol", time: "09:00", kind: "droplet" as IconName, done: completedPlanTasks[plant.id] ?? false })),
  ];
  const completedTasks = allTasks.filter((task) => task.done).length;
  const progress = allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0;
  const weekDates = [["L", "12"], ["M", "13"], ["M", "14"], ["J", "15"], ["V", "16"], ["S", "17"], ["D", "18"]];
  const monthDates = [...Array.from({ length: 3 }, () => ""), ...Array.from({ length: 31 }, (_, index) => String(index + 1))];
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(showUpgradePromptOnOpen);
  const renderDate = (date: string, dayLabel?: string, key = date) => (
    <button key={key} className={`${date === selectedDate ? "active" : ""} ${date === "17" ? "today" : ""}`} disabled={!date} onClick={() => date && setSelectedDate(date)} aria-pressed={date === selectedDate}>
      {dayLabel && <small>{dayLabel}</small>}<strong>{date}</strong>{date && (date === "17" || ["13", "16", "20", "24", "28"].includes(date)) && <span />}
    </button>
  );
  return (
    <div className="screen padded-screen">
      <header className="section-header"><div><span className="eyebrow">Tracker de îngrijire</span><h1>Octombrie 2026</h1></div><button className="today-button" onClick={() => setSelectedDate("17")}>Astăzi</button></header>
      <div className="calendar-switch" role="group" aria-label="Aspect calendar">
        <button className={calendarView === "week" ? "active" : ""} onClick={() => setCalendarView("week")}>Săptămână</button>
        <button className={calendarView === "month" ? "active" : ""} onClick={() => setCalendarView("month")}>Lună</button>
      </div>
      {calendarView === "week" ? (
        <div className="week-strip">{weekDates.map(([day, date]) => renderDate(date, day))}</div>
      ) : (
        <div className="month-calendar">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <span className="month-weekday" key={`${day}-${index}`}>{day}</span>)}
          {monthDates.map((date, index) => renderDate(date, undefined, `month-${index}`))}
        </div>
      )}
      <div className="plan-limit">
        <div><span className="plan-limit-dot" /><b>{Math.max(0, 20 - carePlans.length)} Free Care Plans Available</b></div>
        <button onClick={() => setShowUpgradePrompt(true)}>Upgrade</button>
      </div>
      {showUpgradePrompt && <div className="upgrade-prompt"><b>Ai mai multe plante de îngrijit?</b><span>Treci la un plan extins pentru planuri de îngrijire nelimitate.</span>      <button onClick={() => { setShowUpgradePrompt(false); onDismissUpgradePrompt(); }}>Am înțeles</button></div>}
      <div className="progress-card">
        <div className="progress-copy"><span>{selectedDate === "17" ? "Progresul de azi" : `Progres · ${selectedDate} octombrie`}</span><strong>{completedTasks} din {allTasks.length} sarcini</strong></div>
        <div className="progress-ring" style={{ background: `conic-gradient(var(--sun) ${progress}%, rgba(255,255,255,.18) 0)` }}><span>{progress}%</span></div>
      </div>
      {carePlans.length > 0 && <section className="care-plans">
        <div className="list-heading"><div><h2>Planurile plantelor tale</h2><span>Personalizate după scanarea plantei</span></div></div>
        {carePlans.map((plant) => <button className="care-plan-card" key={plant.id} onClick={() => onOpenPlant(plant.id)}>
          <PlantMark type={plant.type} />
          <div><span className="care-plan-label">PROFIL PLANTĂ · {plant.stage === "seedling" ? "RĂSAD" : plant.stage === "blooming" ? "ÎNFLORIRE" : "MATURĂ"}</span><b>{plant.name}</b><small>Udare la 3 zile · 6–8 ore de lumină</small></div>
          <Icon name="chevron" size={17} />
        </button>)}
      </section>}
      <div className="list-heading"><div><h2>{selectedDate === "17" ? "Planul de azi" : `Planul zilei · ${selectedDate} oct`}</h2><span>{allTasks.length} activități · atinge pentru a bifa</span></div><button onClick={() => setTasks([...tasks, { plant: "Planta mea", task: "Verifică solul", time: "17:30", kind: "sprout", done: false }])}><Icon name="plus" size={17} /> Adaugă</button></div>
      <div className="task-list">
        {allTasks.map((task, index) => (
          <button className={`task-card ${task.done ? "done" : ""}`} key={`${task.plant}-${index}`} onClick={() => index < tasks.length ? setTasks(tasks.map((item, i) => i === index ? { ...item, done: !item.done } : item)) : setCompletedPlanTasks((completed) => ({ ...completed, [task.id]: !task.done }))}>
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

function GardenScreen({ carePlans, onUpdateCarePlant, initialSelectedPlantId }: { carePlans: ScannedPlant[]; onUpdateCarePlant: (plant: ScannedPlant) => void; initialSelectedPlantId: string }) {
  const [plants, setPlants] = useState([
    { id: "monstera", type: "leaf" as const, name: "Monstera", x: 21, y: 25, stage: "mature" as const, progress: 82, thirsty: true },
    { id: "basil", type: "herb" as const, name: "Busuioc", x: 68, y: 22, stage: "blooming" as const, progress: 58, thirsty: false },
    { id: "lavender", type: "flower" as const, name: "Lavandă", x: 44, y: 63, stage: "blooming" as const, progress: 71, thirsty: false },
    ...carePlans.map((plant, index) => ({ ...plant, x: 25 + index * 18, y: 52 })),
  ]);
  const [selectedPlantId, setSelectedPlantId] = useState(initialSelectedPlantId);
  const [layout, setLayout] = useState<"Balcon" | "Etajeră" | "Curte">("Balcon");
  const visiblePlants = plants;
  const selectedPlant = visiblePlants.find((plant) => plant.id === selectedPlantId);
  const thirstyPlants = visiblePlants.filter((plant) => plant.thirsty);
  const updateSelectedPlant = (updates: Partial<ScannedPlant>) => {
    const updatedPlant = plants.find((plant) => plant.id === selectedPlantId);
    if (!updatedPlant) return;
    const nextPlant = { ...updatedPlant, ...updates };
    setPlants((current) => current.map((plant) => plant.id === selectedPlantId ? nextPlant : plant));
    if (carePlans.some((carePlant) => carePlant.id === selectedPlantId)) onUpdateCarePlant(nextPlant);
  };
  const waterPlant = (plantId: string) => {
    const plant = plants.find((item) => item.id === plantId);
    if (!plant) return;
    const updatedPlant = { ...plant, thirsty: false };
    setPlants((current) => current.map((item) => item.id === plantId ? updatedPlant : item));
    if (carePlans.some((carePlant) => carePlant.id === plantId)) onUpdateCarePlant(updatedPlant);
  };
  const addPlant = (type: "leaf" | "flower" | "herb", name: string) => {
    if (visiblePlants.length >= 6) return;
    const id = `garden-${Date.now()}`;
    const plant = { id, type, name, x: 18 + ((visiblePlants.length * 23) % 65), y: 18 + ((visiblePlants.length * 19) % 65), stage: "seedling" as const, progress: 12, thirsty: false };
    setPlants((current) => [...current, plant]);
    setSelectedPlantId(id);
  };

  return (
    <div className="screen padded-screen garden-screen">
      <header className="section-header"><div><span className="eyebrow">Spațiul tău</span><h1>{layout === "Balcon" ? "Grădina mea" : layout === "Etajeră" ? "Etajera mea" : "Curtea mea"}</h1></div><IconButton icon="settings" label="Setări grădină" /></header>

      <section className={`garden-summary ${thirstyPlants.length ? "needs-water" : "all-watered"}`} aria-live="polite">
        <div className="garden-summary-count"><Icon name="garden" size={19} /><span><b>{visiblePlants.length} plante</b><small>{thirstyPlants.length ? `${thirstyPlants.length} au nevoie de apă` : "Toate sunt îngrijite"}</small></span></div>
        {thirstyPlants[0] && <button className="water-action" onClick={() => waterPlant(thirstyPlants[0].id)}><Icon name="droplet" size={15} /> Am udat-o</button>}
      </section>
      <div className="layout-picker" role="group" aria-label="Alege spațiul grădinii">
        {(["Balcon", "Etajeră", "Curte"] as const).map((item) => <button key={item} className={layout === item ? "active" : ""} onClick={() => setLayout(item)}>{item}</button>)}
      </div>
      <div className="garden-map-heading"><h2>Plantele tale</h2><span>Atinge o plantă pentru detalii</span></div>
      <div className="garden-canvas">
        <div className="canvas-grid" />
        <div className="balcony-edge">{layout === "Balcon" ? "BALCON" : layout === "Etajeră" ? "ETAJERĂ" : "CURTE"}</div>
        {visiblePlants.map((plant) => (
          <button className={`placed-plant ${selectedPlantId === plant.id ? "selected" : ""}`} key={plant.id} style={{ left: `${plant.x}%`, top: `${plant.y}%` }} onClick={() => setSelectedPlantId(plant.id)} aria-label={`${plant.name}, ${plant.stage === "seedling" ? "răsad" : plant.stage === "blooming" ? "înflorire" : "matură"}`}>
            <PlantObject type={plant.type} selected={selectedPlantId === plant.id} />
            <span>{plant.name}</span>
            {plant.thirsty && <i className="thirsty-indicator"><Icon name="droplet" size={11} /> Udă-mă</i>}
          </button>
        ))}
        <div className="door-shape">{layout === "Balcon" ? "UȘĂ" : layout === "Etajeră" ? "FEREASTRĂ" : "ALEE"}</div>
      </div>
      {selectedPlant && <section className="plant-profile-editor">
        <div className="selected-plant-summary"><PlantMark type={selectedPlant.type} /><div className="selected-plant-copy"><b>{selectedPlant.name}</b><small>{selectedPlant.stage === "seedling" ? "Răsad" : selectedPlant.stage === "blooming" ? "Înflorire" : "Plantă matură"} · Progres {selectedPlant.progress}%</small><span className="selected-plant-progress"><i style={{ width: `${selectedPlant.progress}%` }} /></span></div>{selectedPlant.thirsty && <span className="selected-plant-status">De udat</span>}</div>
        <details className="plant-edit-details">
          <summary>Editează detaliile</summary>
          <label className="plant-name-field">Numele plantei<input value={selectedPlant.name} onChange={(event) => updateSelectedPlant({ name: event.target.value })} aria-label="Numele plantei" /></label>
          <label className="stage-picker">Etapă de creștere<select value={selectedPlant.stage} onChange={(event) => updateSelectedPlant({ stage: event.target.value as ScannedPlant["stage"] })}><option value="seedling">Răsad</option><option value="blooming">Înflorire</option><option value="mature">Matură</option></select></label>
          <div className="plant-progress"><div><span>Progresul plantei</span><b>{selectedPlant.progress}%</b></div><input type="range" min="0" max="100" value={selectedPlant.progress} onChange={(event) => updateSelectedPlant({ progress: Number(event.target.value) })} aria-label="Progresul plantei" /></div>
        </details>
      </section>}
      <div className="plant-tray">
        <div className="list-heading"><div><h2>Adaugă o plantă</h2><span>Atinge pentru a plasa</span></div></div>
        <div className="plant-options">
          <button onClick={() => addPlant("herb", "Mentă")}><PlantObject type="herb" /><span>Mentă</span></button>
          <button onClick={() => addPlant("flower", "Mușcată")}><PlantObject type="flower" /><span>Mușcată</span></button>
          <button onClick={() => addPlant("leaf", "Ficus")}><PlantObject type="leaf" /><span>Ficus</span></button>
          <button className="add-empty"><Icon name="plus" /><span>Altele</span></button>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="screen padded-screen profile-screen">
      <header className="section-header"><div className="wordmark"><img src="/rod.jpeg?v=2" alt="" />rod</div><IconButton icon="settings" label="Setări profil" /></header>
      <div className="profile-intro">
        <Avatar image={photos.balcony} name="Alexandra" size="lg" />
        <div><h1>Alexandra</h1><span>Grădinar urban · Nivel 8</span><div className="profile-stats"><b>24 <small>plante</small></b><b>1.2k <small>prieteni</small></b></div></div>
      </div>
      <div className="achievement-card"><div className="achievement-icon"><Icon name="sprout" /></div><div><span>Realizare nouă</span><b>30 de zile de îngrijire</b></div><Icon name="chevron" /></div>
      <div className="profile-tabs"><button className="active">Pentru tine</button><button>Salvate</button><button>Postări</button></div>
      <section className="hub-section">
        <div className="list-heading"><div><h2>Evenimente</h2><span>În apropierea ta</span></div><button onClick={() => onNavigate("events")}>Vezi toate</button></div>
        <article className="event-card">
          <img src={photos.garden} alt="Atelier într-o grădină urbană" />
          <div className="event-date"><b>24</b><small>MAI</small></div>
          <div className="event-copy"><span>Atelier practic</span><b>Grădina comestibilă pe balcon</b><small><Icon name="map" size={13} /> Grădina Botanică · 11:00</small></div>
        </article>
      </section>
      <section className="hub-section">
        <div className="list-heading"><div><h2>Sfatul expertului</h2><span>Ales pentru grădina ta</span></div></div>
        <article className="expert-card"><div className="expert-copy"><span>GHID · 5 MIN</span><b>De ce se îngălbenesc frunzele?</b><p>Învață să citești cele mai comune semnale ale plantelor tale.</p><button onClick={() => onNavigate("tips")}>Citește ghidul <Icon name="chevron" size={14} /></button></div><img src={photos.plants} alt="Frunze verzi sănătoase" /></article>
      </section>
    </div>
  );
}

function BottomNav({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  const tabs = [
    { id: "feed", icon: "home" as IconName, label: "Acasă" },
    { id: "chat", icon: "comment" as IconName, label: "Chat" },
    { id: "events", icon: "map" as IconName, label: "Evenimente" },
    { id: "calendar", icon: "calendar" as IconName, label: "Calendar" },
    { id: "tips", icon: "sprout" as IconName, label: "Sfaturi" },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => <button className={active === tab.id ? "active" : ""} key={tab.id} onClick={() => onChange(tab.id)} aria-current={active === tab.id ? "page" : undefined}><Icon name={tab.icon} /><small>{tab.label}</small></button>)}
    </nav>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [active, setActive] = useState("feed");
  const [scanner, setScanner] = useState(false);
  const [carePlans, setCarePlans] = useState<ScannedPlant[]>([]);
  const [selectedGardenPlantId, setSelectedGardenPlantId] = useState("monstera");
  const [showPlanLimitPrompt, setShowPlanLimitPrompt] = useState(false);

  const content = active === "chat" ? <ChatScreen /> : active === "events" ? <EventsScreen /> : active === "tips" ? <TipsScreen /> : active === "calendar" ? <CalendarScreen carePlans={carePlans} onOpenPlant={(plantId) => { setSelectedGardenPlantId(plantId); setActive("garden"); }} showUpgradePromptOnOpen={showPlanLimitPrompt} onDismissUpgradePrompt={() => setShowPlanLimitPrompt(false)} /> : active === "garden" ? <GardenScreen carePlans={carePlans} initialSelectedPlantId={selectedGardenPlantId} onUpdateCarePlant={(plant) => setCarePlans((plans) => plans.map((item) => item.id === plant.id ? plant : item))} /> : active === "profile" ? <ProfileScreen onNavigate={setActive} /> : <Feed onNavigate={setActive} onScan={() => setScanner(true)} />;

  return (
    <main className="app-stage">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="phone-shell">
        {!onboarded ? <Onboarding onComplete={() => setOnboarded(true)} /> : (
          <>
            <div className="app-content">{content}</div>
            <BottomNav active={active} onChange={setActive} />
            {scanner && <Scanner onClose={() => setScanner(false)} onAdd={(plant) => {
              if (carePlans.length >= 20) {
                setShowPlanLimitPrompt(true);
                setScanner(false);
                setActive("calendar");
                return;
              }
              setCarePlans((plans) => [...plans, plant]);
              setScanner(false);
              setActive("calendar");
            }} />}
          </>
        )}
      </div>
      <div className="desktop-note"><img src="/rod.jpeg?v=2" alt="" /><span>rod · grădina care crește cu tine</span></div>
    </main>
  );
}
