import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "mustang2026";
const STORAGE_KEY = "mmc-gallery";
const MAX_PHOTOS = 24;

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

function Gallery({ items }) {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div className="hero-container">
        <div className="hero-emblem"><FlameIcon /> <span className="horse-emblem">🐴</span> <FlameIcon /></div>
        <h1 className="hero-title">Mustang Metal<br />Creations</h1>
        <p className="hero-subtitle">FORGED IN FIRE · BUILT TO LAST</p>
        <div className="accent-divider" />
        <p className="hero-description">Custom metal furniture, mobile welding, and one-of-a-kind home furnishings crafted in Southern Oregon.</p>
        <a href="#gallery" className="btn-action-glow">View Our Work</a>
        <div className="services-strip">
          {["🔧 Mobile Welding", "🏠 Custom Furnishings", "⚡ Metal Fabrication"].map(s => (
            <span key={s} className="service-tag">{s}</span>
          ))}
        </div>
      </div>

      <div id="gallery" className="gallery-section">
        <h2 className="section-title">Our Work</h2>
        <p className="section-subtitle">Custom Pieces · Each One Unique</p>
        {items.length === 0 ? (
          <div className="empty-state">Gallery coming soon — check back shortly!</div>
        ) : (
          <div className="grid-layout">
            {items.map(item => (
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
      </div>

      <div className="contact-section">
        <h2 className="section-title" style={{ fontSize: "2rem", marginBottom: "2.5rem" }}>Get In Touch</h2>
        <div className="contact-flex-container">
          {[
            { label: "Contact", val: "Kris Marie" },
            { label: "Phone", val: "541-295-4498", href: "tel:5412954498" },
            { label: "Email", val: "mustangmetalc@gmail.com", href: "mailto:mustangmetalc@gmail.com" },
            { label: "Website", val: "mustangmetal.shop", href: "https://mustangmetal.shop" },
          ].map(c => (
            <div key={c.label} className="contact-badge">
              <p className="badge-label">{c.label}</p>
              {c.href ? <a href={c.href} className="badge-link">{c.val}</a> : <p className="badge-value">{c.val}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-credits">© 2026 Mustang Metal Creations · Southern Oregon</div>

      {sel && (
        <div onClick={() => setSel(null)} className="lightbox-overlay">
          <div onClick={e => e.stopPropagation()} className="lightbox-window">
            <img src={sel.src} alt={sel.title} className="lightbox-img" />
            <div className="lightbox-footer">
              <div>
                <h3 className="lightbox-title">{sel.title}</h3>
                {sel.desc && <p className="lightbox-desc">{sel.desc}</p>}
              </div>
              {sel.price && <div className="card-price-tag" style={{ fontSize: "1.1rem" }}>{sel.price}</div>}
            </div>
            <button onClick={() => setSel(null)} className="btn-close-modal">CLOSE WINDOW</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Admin({ items, setItems, onLogout }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [src, setSrc] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const fileRef = useRef();

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setSrc(compressed);
    setPreview(compressed);
  };

  const save = async () => {
    if (!title.trim()) { flash("⚠ Title is required"); return; }
    if (!src && !editId) { flash("⚠ Please select a photo"); return; }
    setSaving(true);
    try {
      let updated;
      if (editId) {
        updated = items.map(i => i.id === editId ? { ...i, title: title.trim(), desc: desc.trim(), price: price.trim(), ...(src ? { src } : {}) } : i);
      } else {
        if (items.length >= MAX_PHOTOS) { flash(`⚠ Max ${MAX_PHOTOS} photos reached`); setSaving(false); return; }
        updated = [...items, { id: Date.now().toString(), title: title.trim(), desc: desc.trim(), price: price.trim(), src }];
      }
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      resetForm();
      flash(editId ? "✓ Item updated!" : "✓ Photo added to gallery!");
    } catch (err) {
      flash("✗ Save failed — storage may be full");
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm("Remove this item from the gallery?")) return;
    const updated = items.filter(i => i.id !== id);
    await window.storage.set(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated);
    if (editId === id) resetForm();
    flash("✓ Item removed");
  };

  const startEdit = (item) => {
    setEditId(item.id); setTitle(item.title); setDesc(item.desc || "");
    setPrice(item.price || ""); setPreview(item.src); setSrc(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null); setTitle(""); setDesc(""); setPrice(""); setSrc(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="admin-bg">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">🐴 MMC Gallery Manager</h1>
          <p className="admin-subtitle">MUSTANG METAL CREATIONS · ADMIN</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span className="allocation-counter">{items.length} / {MAX_PHOTOS} PHOTOS</span>
          <button onClick={onLogout} className="btn-logout">LOG OUT</button>
        </div>
      </div>

      {msg && <div className={`status-banner ${msg.startsWith("✓") ? "success" : "error"}`}>{msg}</div>}

      <div className="admin-workspace-grid">
        <div>
          <div className="admin-form-card">
            <h2 className="form-card-title">{editId ? "✏️ Edit Item" : "➕ Add New Photo"}</h2>
            <input type="text" placeholder="Item Title *" value={title} onChange={e => setTitle(e.target.value)} className="admin-input" style={{ marginBottom: "0.75rem" }} />
            <input type="text" placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} className="admin-input" style={{ marginBottom: "0.75rem" }} />
            <input type="text" placeholder="Price (e.g. $350 or Starting at $200)" value={price} onChange={e => setPrice(e.target.value)} className="admin-input" style={{ marginBottom: "0.75rem" }} />
            <div onClick={() => fileRef.current.click()} className="uploader-zone">
              {preview ? <img src={preview} className="uploader-preview-img" alt="preview" /> : <span className="uploader-prompt">📷 Tap to select photo<br /><small>JPG, PNG, WEBP</small></span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={save} disabled={saving} className="btn-submit-asset">
                {saving ? "Saving…" : editId ? "Update" : "Add to Gallery"}
              </button>
              {editId && <button onClick={resetForm} className="btn-cancel-edit">Cancel</button>}
            </div>
          </div>
          <div className="tips-card">
            <p className="tips-text">💡 <strong>Tips:</strong><br />• Photos auto-compress on upload<br />• Leave price blank to show as custom quote<br />• Up to {MAX_PHOTOS} photos total</p>
          </div>
        </div>

        <div>
          <h2 className="form-card-title" style={{ marginBottom: "1.5rem" }}>Gallery ({items.length} items)</h2>
          {items.length === 0 ? (
            <div className="admin-empty-state">No photos yet — add your first piece!</div>
          ) : (
            <div className="admin-mini-grid">
              {items.map(item => (
                <div key={item.id} className={`admin-mini-card ${editId === item.id ? "active-edit" : ""}`}>
                  <div className="mini-card-img-wrap"><img src={item.src} alt={item.title} className="card-img" /></div>
                  <div style={{ padding: "0.75rem" }}>
                    <p className="mini-card-title">{item.title}</p>
                    {item.price && <p className="mini-card-price">{item.price}</p>}
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                      <button onClick={() => startEdit(item)} className="btn-mini-action edit">EDIT</button>
                      <button onClick={() => remove(item.id)} className="btn-mini-action delete">REMOVE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const attempt = () => {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr("Wrong password. Try again."); setPw(""); }
  };
  return (
    <div className="login-wrapper">
      <div className="login-card-panel">
        <div className="login-emblem">🐴</div>
        <h1 className="login-heading">Admin Access</h1>
        <p className="login-subheading">MUSTANG METAL CREATIONS</p>
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()} className="admin-input" style={{ textAlign: "center", marginBottom: "0.75rem" }} />
        {err && <p className="login-error-text">{err}</p>}
        <button onClick={attempt} className="btn-submit-asset" style={{ width: "100%" }}>ENTER</button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("public");
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) setItems(JSON.parse(res.value));
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  const clicks = useRef(0);
  const clickTimer = useRef(null);
  const handleLogoClick = () => {
    clicks.current++;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clicks.current = 0; }, 1500);
    if (clicks.current >= 5) { clicks.current = 0; setView("login"); }
  };

  if (!loaded) return <div className="loading-screen">Loading…</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Cinzel:wght@400;700&family=Raleway:wght@300;400;600&display=swap');
        :root { --bg-darker:#06060a; --bg-card:#11111a; --bg-surface:#0a0a10; --neon-magenta:#d400ff; --neon-orange:#ff4400; --text-cyan:#8ab4c8; --border-color:rgba(212,0,255,0.15); }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg-darker); color:#fff; font-family:'Raleway',sans-serif; }

        .hero-container { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem 2rem 6rem; position:relative; overflow:hidden; background:radial-gradient(ellipse at 30% 20%,rgba(212,0,255,0.12) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(255,68,0,0.14) 0%,transparent 60%),var(--bg-surface); }
        .hero-emblem { font-size:3rem; margin-bottom:1.5rem; }
        .horse-emblem { filter:drop-shadow(0 0 12px var(--text-cyan)); }
        .flame-effect { display:inline-block; animation:flicker 1.5s ease-in-out infinite alternate; }
        .hero-title { font-family:'Black Ops One',cursive; font-size:clamp(2.5rem,8.5vw,5rem); line-height:1.1; letter-spacing:2px; background:linear-gradient(135deg,#fff 10%,var(--text-cyan) 40%,var(--neon-magenta) 75%,var(--neon-orange) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; filter:drop-shadow(0 0 25px rgba(212,0,255,0.35)); }
        .hero-subtitle { font-family:'Cinzel',serif; letter-spacing:0.35em; color:var(--text-cyan); margin-top:1rem; font-size:1.05rem; font-weight:700; }
        .accent-divider { width:160px; height:2px; margin:2rem auto; background:linear-gradient(90deg,transparent,var(--neon-magenta),var(--neon-orange),transparent); }
        .hero-description { color:#a5b4c4; max-width:550px; line-height:1.8; font-weight:300; font-size:1.05rem; }
        .btn-action-glow { display:inline-block; margin-top:2.5rem; padding:1rem 2.5rem; font-family:'Cinzel',serif; letter-spacing:0.2em; text-transform:uppercase; color:#fff; border:1px solid var(--neon-magenta); text-decoration:none; background:transparent; font-size:0.85rem; font-weight:700; transition:all 0.4s; box-shadow:0 0 15px rgba(212,0,255,0.1); }
        .btn-action-glow:hover { background:linear-gradient(135deg,var(--neon-magenta),var(--neon-orange)); border-color:transparent; box-shadow:0 0 25px rgba(255,68,0,0.5); transform:translateY(-2px); }
        .services-strip { position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:center; gap:3rem; padding:1.5rem; background:rgba(5,5,10,0.85); border-top:1px solid rgba(212,0,255,0.1); flex-wrap:wrap; }
        .service-tag { color:var(--text-cyan); font-size:0.85rem; letter-spacing:0.15em; font-weight:600; }

        .gallery-section { background:var(--bg-darker); padding:6rem 2rem; }
        .section-title { font-family:'Black Ops One',cursive; text-align:center; font-size:clamp(1.8rem,5vw,2.8rem); color:var(--text-cyan); }
        .section-subtitle { text-align:center; color:#404555; letter-spacing:0.3em; font-size:0.8rem; text-transform:uppercase; margin-top:0.5rem; margin-bottom:4rem; }
        .empty-state { text-align:center; color:#404555; padding:4rem; font-size:0.95rem; }
        .grid-layout { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:2rem; max-width:1200px; margin:0 auto; }
        .gallery-card { background:var(--bg-card); border:1px solid var(--border-color); overflow:hidden; cursor:pointer; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); box-shadow:0 8px 30px rgba(0,0,0,0.3); }
        .gallery-card:hover { border-color:rgba(255,68,0,0.4); transform:translateY(-6px); box-shadow:0 12px 40px rgba(255,68,0,0.15); }
        .card-image-wrapper { position:relative; padding-bottom:80%; background:#050508; overflow:hidden; }
        .card-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform 0.6s; }
        .gallery-card:hover .card-img { transform:scale(1.04); }
        .card-body { padding:1.5rem; border-top:1px solid rgba(255,255,255,0.02); }
        .card-heading { font-family:'Cinzel',serif; color:var(--text-cyan); font-size:1.1rem; margin-bottom:0.5rem; letter-spacing:1px; }
        .card-text { color:#707b88; font-size:0.9rem; line-height:1.6; margin-bottom:1rem; font-weight:300; }
        .card-price-tag { display:inline-block; padding:0.4rem 1.2rem; background:linear-gradient(135deg,rgba(212,0,255,0.15),rgba(255,68,0,0.15)); border:1px solid rgba(212,0,255,0.3); color:#ff55bb; font-size:0.85rem; font-family:'Cinzel',serif; letter-spacing:0.1em; font-weight:700; }

        .contact-section { background:var(--bg-surface); border-top:1px solid rgba(212,0,255,0.08); padding:6rem 2rem; }
        .contact-flex-container { display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; max-width:1100px; margin:0 auto; }
        .contact-badge { background:var(--bg-card); border:1px solid rgba(255,255,255,0.03); padding:1.5rem 2rem; min-width:180px; flex:1; max-width:260px; }
        .badge-label { color:#4b5568; font-size:0.7rem; letter-spacing:0.3em; text-transform:uppercase; margin-bottom:0.6rem; }
        .badge-value { color:var(--text-cyan); font-family:'Cinzel',serif; font-size:0.95rem; }
        .badge-link { color:var(--text-cyan); text-decoration:none; font-family:'Cinzel',serif; font-size:0.95rem; transition:color 0.2s; }
        .badge-link:hover { color:var(--neon-magenta); }
        .footer-credits { text-align:center; padding:2rem; color:#3a4050; font-size:0.8rem; letter-spacing:0.15em; background:#040407; border-top:1px solid rgba(0,0,0,0.5); }

        .lightbox-overlay { position:fixed; inset:0; background:rgba(3,3,5,0.95); z-index:1000; display:flex; align-items:center; justify-content:center; padding:2rem; animation:fadeIn 0.25s ease; }
        .lightbox-window { max-width:850px; width:100%; background:var(--bg-card); border:1px solid rgba(212,0,255,0.25); }
        .lightbox-img { width:100%; max-height:65vh; object-fit:contain; display:block; background:#020204; }
        .lightbox-footer { padding:1.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem; border-top:1px solid rgba(255,255,255,0.02); }
        .lightbox-title { font-family:'Cinzel',serif; color:var(--text-cyan); font-size:1.3rem; }
        .lightbox-desc { color:#808b98; margin-top:0.5rem; font-size:0.95rem; }
        .btn-close-modal { width:100%; padding:1rem; background:#151520; border:none; border-top:1px solid rgba(255,255,255,0.04); color:#5a6578; cursor:pointer; letter-spacing:0.2em; font-size:0.8rem; font-weight:600; }
        .btn-close-modal:hover { background:#1a1a26; color:#fff; }

        .admin-bg { background:var(--bg-darker); min-height:100vh; }
        .admin-header { background:#0d0d14; border-bottom:1px solid var(--border-color); padding:1.5rem 2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; }
        .admin-title { font-family:'Black Ops One',cursive; color:var(--text-cyan); font-size:1.4rem; letter-spacing:1px; }
        .admin-subtitle { color:#404b5a; font-size:0.75rem; letter-spacing:0.2em; margin-top:0.25rem; }
        .allocation-counter { color:#5a6578; font-size:0.8rem; background:#07070a; padding:0.4rem 1rem; border:1px solid rgba(255,255,255,0.02); }
        .btn-logout { padding:0.5rem 1.5rem; background:transparent; border:1px solid #3a4050; color:#7a8598; cursor:pointer; font-size:0.8rem; letter-spacing:0.1em; }
        .btn-logout:hover { border-color:#ff3344; color:#ff3344; }
        .admin-workspace-grid { max-width:1200px; margin:0 auto; padding:3rem 2rem; display:grid; grid-template-columns:360px 1fr; gap:3rem; }
        @media(max-width:900px){ .admin-workspace-grid { grid-template-columns:1fr; } }
        .admin-form-card { background:var(--bg-card); border:1px solid var(--border-color); padding:2rem; }
        .form-card-title { color:var(--text-cyan); font-family:'Cinzel',serif; font-size:1.1rem; margin-bottom:1.5rem; border-bottom:1px solid rgba(212,0,255,0.1); padding-bottom:0.75rem; }
        .admin-input { width:100%; padding:0.85rem 1.2rem; background:#07070a; border:1px solid rgba(212,0,255,0.15); color:#ddd; font-family:'Raleway',sans-serif; font-size:0.95rem; outline:none; display:block; }
        .admin-input:focus { border-color:var(--neon-orange); box-shadow:0 0 10px rgba(255,68,0,0.15); }
        .uploader-zone { border:2px dashed rgba(212,0,255,0.2); padding:2rem; text-align:center; cursor:pointer; margin-bottom:1rem; background:rgba(212,0,255,0.02); transition:all 0.3s; }
        .uploader-zone:hover { border-color:var(--neon-magenta); }
        .uploader-preview-img { max-width:100%; max-height:180px; object-fit:contain; }
        .uploader-prompt { color:#5a6578; font-size:0.9rem; line-height:1.5; }
        .btn-submit-asset { flex:1; padding:0.95rem; background:linear-gradient(135deg,var(--neon-magenta),var(--neon-orange)); border:none; color:#fff; cursor:pointer; font-family:'Cinzel',serif; letter-spacing:0.15em; font-size:0.85rem; font-weight:700; }
        .btn-submit-asset:disabled { background:#222; color:#555; cursor:not-allowed; }
        .btn-cancel-edit { padding:0.95rem 1.2rem; background:transparent; border:1px solid #3a4050; color:#7a8598; cursor:pointer; font-size:0.85rem; }
        .tips-card { margin-top:1.5rem; background:var(--bg-card); border:1px solid rgba(255,255,255,0.02); padding:1.25rem 1.5rem; }
        .tips-text { color:#5a6578; font-size:0.8rem; line-height:1.8; }
        .admin-empty-state { color:#4a5568; padding:5rem 2rem; text-align:center; border:1px dashed rgba(255,255,255,0.03); }
        .admin-mini-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:1.25rem; }
        .admin-mini-card { background:#0d0d14; border:1px solid rgba(255,255,255,0.03); overflow:hidden; }
        .admin-mini-card.active-edit { border-color:var(--neon-magenta); box-shadow:0 0 15px rgba(212,0,255,0.2); }
        .mini-card-img-wrap { position:relative; padding-bottom:75%; background:#050508; }
        .mini-card-title { color:#a0aec0; font-size:0.85rem; font-family:'Cinzel',serif; margin-bottom:0.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .mini-card-price { color:#b794f4; font-size:0.8rem; font-weight:600; }
        .btn-mini-action { flex:1; padding:0.4rem; border:none; font-size:0.7rem; font-weight:700; cursor:pointer; }
        .btn-mini-action.edit { background:rgba(212,0,255,0.12); color:#ff66dd; border:1px solid rgba(212,0,255,0.2); }
        .btn-mini-action.delete { background:rgba(255,68,0,0.08); color:#ff6644; border:1px solid rgba(255,68,0,0.15); }

        .login-wrapper { min-height:100vh; background:var(--bg-darker); display:flex; align-items:center; justify-content:center; padding:2rem; }
        .login-card-panel { background:var(--bg-card); border:1px solid var(--border-color); padding:3rem 2.5rem; width:100%; max-width:380px; text-align:center; }
        .login-emblem { font-size:2.5rem; margin-bottom:1rem; filter:drop-shadow(0 0 10px var(--neon-magenta)); }
        .login-heading { font-family:'Black Ops One',cursive; color:var(--text-cyan); font-size:1.5rem; }
        .login-subheading { color:#404b5a; font-size:0.75rem; letter-spacing:0.25em; margin-bottom:2rem; }
        .login-error-text { color:#ff4444; font-size:0.85rem; margin-bottom:1rem; }
        .status-banner { padding:0.9rem; text-align:center; font-size:0.9rem; font-weight:600; }
        .status-banner.success { background:rgba(0,240,140,0.08); border-bottom:1px solid rgba(0,240,140,0.2); color:#20e090; }
        .status-banner.error { background:rgba(255,80,0,0.08); border-bottom:1px solid rgba(255,80,0,0.2); color:#ff6040; }
        .loading-screen { min-height:100vh; background:var(--bg-darker); display:flex; align-items:center; justify-content:center; color:var(--text-cyan); font-family:'Cinzel',serif; letter-spacing:0.25em; }

        @keyframes flicker { 0%{filter:drop-shadow(0 0 4px var(--neon-orange)) brightness(0.9);} 100%{filter:drop-shadow(0 0 14px #ff8c00) brightness(1.2);} }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
      `}</style>

      {view === "public" && (
        <>
          <Gallery items={items} />
          <div onClick={handleLogoClick} style={{ position:"fixed", bottom:0, right:0, width:24, height:24, cursor:"default", zIndex:9999, opacity:0 }} />
        </>
      )}
      {view === "login" && <Login onLogin={() => setView("admin")} />}
      {view === "admin" && <Admin items={items} setItems={setItems} onLogout={() => setView("public")} />}
    </>
  );
}
