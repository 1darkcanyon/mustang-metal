import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "mustang2026";
const STORAGE_KEY = "mmc-gallery";
const MAX_PHOTOS = 24;

// Compress image to base64 via canvas
function compressImage(file, maxW = 900, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function FlameIcon() {
  return <span className="flame-effect">🔥</span>;
}

// ─── PUBLIC GALLERY ───────────────────────────────────────────────────────────
function Gallery({ items }) {
  const [sel, setSel] = useState(null);

  return (
    <div>
      {items.length === 0 ? (
        <div className="empty-state">
          Gallery coming soon — check back shortly!
        </div>
      ) : (
        <div className="grid-layout">
          {items.map((item) => (
            <div key={item.id} onClick={() => setSel(item)} className="gallery-card">
              <div className="card-image-wrapper">
                <img src={item.src} alt={item.title} className="card-img" />
              </div>
              <div className="card-body">
                <h3 className="card-heading">{item.title}</h3>
                {item.desc && <p className="card-text">{item.desc}</p>}
                {item.price && <div className="card-price-tag">{item.price}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {sel && (
        <div className="modal-overlay" onClick={() => setSel(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={sel.src} alt={sel.title} className="modal-img" />
            <div className="modal-body">
              <h3>{sel.title}</h3>
              {sel.desc && <p>{sel.desc}</p>}
              {sel.price && <div className="modal-price">{sel.price}</div>}
              <button className="close-btn" onClick={() => setSel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN LOGIN INTERFACE ────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const attempt = () => {
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setErr("Identity mismatch. Access denied.");
      setPw("");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-panel">
        <div className="login-emblem">🐴</div>
        <h1 className="login-heading">Admin Interface</h1>
        <p className="login-subheading">MUSTANG METAL CREATIONS</p>
        <input
          type="password"
          placeholder="Passkey Signature"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          className="admin-input"
          style={{ textAlign: "center", marginBottom: "1rem" }}
        />
        {err && <p className="error-text" style={{ color: "#ff4a4a", fontSize: "0.9rem", marginBottom: "1rem" }}>{err}</p>}
        <button onClick={attempt} className="action-btn">Authenticate</button>
      </div>
    </div>
  );
}

// ─── MAIN MANAGEMENT DASHBOARD ───────────────────────────────────────────────
function AdminDashboard({ items, setItems, onLogout }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    if (items.length >= MAX_PHOTOS) {
      alert(`Gallery maximum capacity reached (${MAX_PHOTOS} photos). Delete an existing entry first.`);
      return;
    }

    setLoading(true);
    try {
      const base64 = await compressImage(file);
      const newItem = {
        id: Date.now().toString(),
        title,
        desc,
        price,
        src: base64,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setTitle("");
      setDesc("");
      setPrice("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to permanently remove this piece?")) return;
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="admin-dashboard">
      <div className="dash-header">
        <h2>Portals Management Console</h2>
        <button className="logout-btn" onClick={onLogout}>Exit Session</button>
      </div>

      <form onSubmit={handleUpload} className="upload-form">
        <h3>Deploy New Creation Asset</h3>
        <input type="text" placeholder="Piece Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description / Dimensions (Optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input type="text" placeholder="Pricing info (e.g. $450 or Call for Quote)" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit" disabled={loading} className="action-btn">
          {loading ? "Optimizing Assets..." : "Inject Matrix Entry"}
        </button>
      </form>

      <div className="admin-grid">
        <h3>Current Active Matrix Assets ({items.length}/{MAX_PHOTOS})</h3>
        {items.length === 0 ? (
          <p>No records active. Upload a creation asset above.</p>
        ) : (
          <div className="mini-grid">
            {items.map((item) => (
              <div key={item.id} className="mini-card">
                <img src={item.src} alt={item.title} />
                <div className="mini-info">
                  <h4>{item.title}</h4>
                  <button onClick={() => handleDelete(item.id)} className="delete-btn">Purge</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CORE SYSTEM APPLICATION ──────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("public");
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const clicks = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch (e) {
        console.error("Data tracking fault cleared.");
      }
    }
    setLoaded(true);
  }, []);

  const handleFooterClick = () => {
    clicks.current++;
    clearTimeout(clickTimer.current);
    // 5 second rolling window for mobile stability
    clickTimer.current = setTimeout(() => {
      clicks.current = 0;
    }, 5000);

    if (clicks.current >= 5) {
      clicks.current = 0;
      setView("login");
    }
  };

  if (!loaded) {
    return <div className="loading-screen">INITIALIZING NEXUS MATRIX…</div>;
  }

  return (
    <div className="app-container">
      {/* HEADER STRIP */}
      <header className="brand-header">
        <div className="logo-area">
          <FlameIcon /> 🐴 <FlameIcon />
          <h1 className="neon-text-title">MUSTANG METAL</h1>
          <h1 className="neon-text-title secondary">CREATIONS</h1>
          <p className="tagline">FORGED IN FIRE • BUILT TO LAST</p>
        </div>
        <div className="accent-bar" />
        <p className="intro-paragraph">
          Custom metal furniture, mobile welding, and one-of-a-kind home furnishings crafted in Southern Oregon.
        </p>
      </header>

      {/* CORE DISPLAY ROUTER */}
      <main className="content-frame">
        {view === "public" && (
          <section id="gallery" className="gallery-section">
            <h2 className="section-title">Our Work</h2>
            <p className="section-subtitle">Custom Pieces - Each One Unique</p>
            <Gallery items={items} />
          </section>
        )}

        {view === "login" && (
          <Login onLogin={() => setView("admin")} />
        )}

        {view === "admin" && (
          <AdminDashboard items={items} setItems={setItems} onLogout={() => setView("public")} />
        )}
      </main>

      {/* FOOTER STRIP WITH INTEGRATED ACCESS TRIGGER */}
      <footer className="system-footer" onClick={handleFooterClick} style={{ cursor: "pointer", padding: "2rem 1rem" }}>
        <p className="footer-copyright">
          © 2026 Mustang Metal Creations · Southern Oregon
        </p>
      </footer>
    </div>
  );
}
