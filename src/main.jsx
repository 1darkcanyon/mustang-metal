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
        const c = document.createElement("canvas");
        c.width = img.width * scale;
        c.height = img.height * scale;
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── GALLERY (public view) ─────────────────────────────────────────────────────
function Gallery({ items }) {
  const [sel, setSel] = useState(null);
  return (
    <div>
      {items.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem 1rem", color:"#445566",
          border:"1px dashed rgba(255,255,255,0.07)", margin:"2rem 0", fontSize:"1.1rem" }}>
          Gallery coming soon — check back shortly!
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",
          gap:"1.5rem", maxWidth:1100, margin:"0 auto" }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setSel(item)}
              style={{ background:"#111827", border:"1px solid rgba(212,0,255,0.15)",
                overflow:"hidden", cursor:"pointer", transition:"all 0.3s",
                boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}
              onMouseOver={e => { e.currentTarget.style.borderColor="rgba(255,68,0,0.5)"; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 35px rgba(255,68,0,0.2)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor="rgba(212,0,255,0.15)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.4)"; }}>
              <div style={{ position:"relative", paddingBottom:"75%", background:"#050508", overflow:"hidden" }}>
                <img src={item.src} alt={item.title}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s" }}
                  onMouseOver={e => e.target.style.transform="scale(1.05)"}
                  onMouseOut={e => e.target.style.transform="scale(1)"} />
              </div>
              <div style={{ padding:"1.25rem", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <h3 style={{ fontFamily:"'Orbitron',sans-serif", color:"#8ab4c8", fontSize:"1rem",
                  marginBottom:"0.5rem", letterSpacing:"1px" }}>{item.title}</h3>
                {item.desc && <p style={{ color:"#667788", fontSize:"0.9rem", lineHeight:1.6,
                  marginBottom:"0.75rem", fontWeight:300 }}>{item.desc}</p>}
                {item.price && (
                  <div style={{ display:"inline-block", padding:"0.35rem 1rem",
                    background:"linear-gradient(135deg,rgba(212,0,255,0.15),rgba(255,68,0,0.15))",
                    border:"1px solid rgba(212,0,255,0.4)", color:"#ff55cc",
                    fontFamily:"'Orbitron',sans-serif", fontSize:"0.85rem", letterSpacing:"1px" }}>
                    {item.price}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sel && (
        <div onClick={() => setSel(null)} style={{ position:"fixed", inset:0,
          background:"rgba(0,0,0,0.93)", zIndex:1000, display:"flex",
          alignItems:"center", justifyContent:"center", padding:"1.5rem" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ maxWidth:800, width:"100%", background:"#111827",
              border:"1px solid rgba(212,0,255,0.35)", boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>
            <img src={sel.src} alt={sel.title}
              style={{ width:"100%", maxHeight:"65vh", objectFit:"contain", display:"block", background:"#05050a" }} />
            <div style={{ padding:"1.5rem", display:"flex", justifyContent:"space-between",
              alignItems:"center", flexWrap:"wrap", gap:"1rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <h3 style={{ fontFamily:"'Orbitron',sans-serif", color:"#8ab4c8", fontSize:"1.1rem" }}>{sel.title}</h3>
                {sel.desc && <p style={{ color:"#667788", marginTop:"0.4rem", fontSize:"0.9rem" }}>{sel.desc}</p>}
              </div>
              {sel.price && (
                <div style={{ padding:"0.5rem 1.25rem",
                  background:"linear-gradient(135deg,rgba(212,0,255,0.2),rgba(255,68,0,0.2))",
                  border:"1px solid rgba(212,0,255,0.4)", color:"#ff55cc",
                  fontFamily:"'Orbitron',sans-serif", fontSize:"1rem" }}>{sel.price}</div>
              )}
            </div>
            <button onClick={() => setSel(null)}
              style={{ width:"100%", padding:"0.85rem", background:"transparent", border:"none",
                borderTop:"1px solid rgba(255,255,255,0.05)", color:"#445566",
                cursor:"pointer", letterSpacing:"0.2em", fontSize:"0.8rem" }}
              onMouseOver={e => { e.target.style.background="#1a1a2e"; e.target.style.color="#fff"; }}
              onMouseOut={e => { e.target.style.background="transparent"; e.target.style.color="#445566"; }}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const attempt = () => {
    if (pw === ADMIN_PASSWORD) onLogin();
    else { setErr("Wrong password. Try again."); setPw(""); }
  };
  return (
    <div style={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ background:"#111827", border:"1px solid rgba(212,0,255,0.3)",
        padding:"2.5rem", width:"100%", maxWidth:380, textAlign:"center",
        boxShadow:"0 0 40px rgba(212,0,255,0.1)" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:"1rem",
          filter:"drop-shadow(0 0 12px rgba(212,0,255,0.6))" }}>🐴</div>
        <h2 style={{ fontFamily:"'Orbitron',sans-serif", color:"#8ab4c8",
          fontSize:"1.2rem", marginBottom:"0.3rem", letterSpacing:"2px" }}>ADMIN ACCESS</h2>
        <p style={{ color:"#334455", fontSize:"0.7rem", letterSpacing:"0.25em",
          marginBottom:"1.75rem" }}>MUSTANG METAL CREATIONS</p>
        <input type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()}
          style={{ width:"100%", padding:"0.85rem", background:"#05050a",
            border:"1px solid rgba(212,0,255,0.2)", color:"#ddd",
            fontFamily:"inherit", fontSize:"1rem", outline:"none",
            marginBottom:"0.75rem", textAlign:"center" }} />
        {err && <p style={{ color:"#ff4444", fontSize:"0.85rem", marginBottom:"0.75rem" }}>{err}</p>}
        <button onClick={attempt}
          style={{ width:"100%", padding:"0.9rem",
            background:"linear-gradient(135deg,#d400ff,#ff4400)",
            border:"none", color:"#fff", cursor:"pointer",
            fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.2em", fontSize:"0.85rem" }}>
          ENTER
        </button>
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function Admin({ items, setItems, onLogout }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);
  const fileRef = useRef();

  const flash = m => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

  const handleFile = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const compressed = await compressImage(f);
    setFile(compressed);
    setPreview(compressed);
  };

  const save = async () => {
    if (!title.trim()) { flash("⚠ Title required"); return; }
    if (!file && !editId) { flash("⚠ Please choose a photo"); return; }
    setSaving(true);
    try {
      let updated;
      if (editId) {
        updated = items.map(i => i.id === editId
          ? { ...i, title:title.trim(), desc:desc.trim(), price:price.trim(), ...(file ? {src:file} : {}) }
          : i);
      } else {
        if (items.length >= MAX_PHOTOS) { flash(`⚠ Max ${MAX_PHOTOS} photos reached`); setSaving(false); return; }
        updated = [...items, { id:Date.now().toString(), title:title.trim(), desc:desc.trim(), price:price.trim(), src:file }];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      resetForm();
      flash(editId ? "✓ Updated!" : "✓ Photo added!");
    } catch(e) { flash("✗ Save failed"); }
    setSaving(false);
  };

  const remove = id => {
    if (!confirm("Remove this item from the gallery?")) return;
    const updated = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated);
    if (editId === id) resetForm();
    flash("✓ Removed");
  };

  const startEdit = item => {
    setEditId(item.id); setTitle(item.title); setDesc(item.desc||"");
    setPrice(item.price||""); setPreview(item.src); setFile(null);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const resetForm = () => {
    setEditId(null); setTitle(""); setDesc(""); setPrice(""); setFile(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const inp = (ph, v, s) => (
    <input placeholder={ph} value={v} onChange={e => s(e.target.value)}
      style={{ width:"100%", padding:"0.8rem 1rem", background:"#05050a",
        border:"1px solid rgba(212,0,255,0.15)", color:"#ccc",
        fontFamily:"inherit", fontSize:"0.95rem", outline:"none",
        marginBottom:"0.75rem", display:"block" }}
      onFocus={e => e.target.style.borderColor="#ff4400"}
      onBlur={e => e.target.style.borderColor="rgba(212,0,255,0.15)"} />
  );

  return (
    <div style={{ background:"#06060a", minHeight:"60vh", padding:"0 0 3rem" }}>
      {/* Admin header */}
      <div style={{ background:"#0d0d18", borderBottom:"1px solid rgba(212,0,255,0.2)",
        padding:"1.25rem 1.5rem", display:"flex", justifyContent:"space-between",
        alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h2 style={{ fontFamily:"'Orbitron',sans-serif", color:"#8ab4c8",
            fontSize:"1.1rem", letterSpacing:"2px" }}>🐴 GALLERY MANAGER</h2>
          <p style={{ color:"#334", fontSize:"0.65rem", letterSpacing:"0.2em" }}>
            {items.length}/{MAX_PHOTOS} PHOTOS
          </p>
        </div>
        <button onClick={onLogout}
          style={{ padding:"0.5rem 1.5rem", background:"transparent",
            border:"1px solid #334", color:"#778", cursor:"pointer",
            fontSize:"0.8rem", letterSpacing:"0.1em" }}
          onMouseOver={e => { e.target.style.borderColor="#ff3344"; e.target.style.color="#ff3344"; }}
          onMouseOut={e => { e.target.style.borderColor="#334"; e.target.style.color="#778"; }}>
          LOG OUT
        </button>
      </div>

      {msg && (
        <div style={{ padding:"0.85rem", textAlign:"center", fontSize:"0.9rem",
          background: msg.startsWith("✓") ? "rgba(0,220,120,0.08)" : "rgba(255,80,0,0.08)",
          borderBottom: `1px solid ${msg.startsWith("✓") ? "rgba(0,220,120,0.3)" : "rgba(255,80,0,0.3)"}`,
          color: msg.startsWith("✓") ? "#0c8" : "#f84" }}>
          {msg}
        </div>
      )}

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem",
        display:"grid", gridTemplateColumns:"minmax(280px,340px) 1fr", gap:"2rem" }}>

        {/* Form */}
        <div>
          <div style={{ background:"#111827", border:"1px solid rgba(212,0,255,0.15)", padding:"1.5rem" }}>
            <h3 style={{ color:"#8ab4c8", fontFamily:"'Orbitron',sans-serif",
              fontSize:"0.85rem", letterSpacing:"0.15em", marginBottom:"1.25rem",
              borderBottom:"1px solid rgba(212,0,255,0.12)", paddingBottom:"0.75rem" }}>
              {editId ? "✏ EDIT ITEM" : "➕ ADD PHOTO"}
            </h3>
            {inp("Piece Title *", title, setTitle)}
            {inp("Description (optional)", desc, setDesc)}
            {inp("Price (e.g. $350 or Starting at $200)", price, setPrice)}

            <div onClick={() => fileRef.current.click()}
              style={{ border:"2px dashed rgba(212,0,255,0.25)", padding:"1.5rem",
                textAlign:"center", cursor:"pointer", marginBottom:"1rem",
                background:"rgba(212,0,255,0.03)", transition:"border-color 0.3s" }}
              onMouseOver={e => e.currentTarget.style.borderColor="rgba(212,0,255,0.6)"}
              onMouseOut={e => e.currentTarget.style.borderColor="rgba(212,0,255,0.25)"}>
              {preview
                ? <img src={preview} style={{ maxWidth:"100%", maxHeight:160, objectFit:"contain" }} alt="preview" />
                : <span style={{ color:"#445566", fontSize:"0.9rem" }}>📷 Tap to choose photo<br/><small style={{fontSize:"0.75rem"}}>JPG · PNG · WEBP</small></span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button onClick={save} disabled={saving}
                style={{ flex:1, padding:"0.9rem",
                  background: saving ? "#222" : "linear-gradient(135deg,#d400ff,#ff4400)",
                  border:"none", color:"#fff", cursor: saving ? "not-allowed" : "pointer",
                  fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.15em", fontSize:"0.8rem" }}>
                {saving ? "SAVING…" : editId ? "UPDATE" : "ADD TO GALLERY"}
              </button>
              {editId && (
                <button onClick={resetForm}
                  style={{ padding:"0.9rem 1rem", background:"transparent",
                    border:"1px solid #334", color:"#778", cursor:"pointer", fontSize:"0.8rem" }}>
                  CANCEL
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop:"1rem", background:"#111827",
            border:"1px solid rgba(255,255,255,0.04)", padding:"1rem 1.25rem" }}>
            <p style={{ color:"#334", fontSize:"0.75rem", lineHeight:1.9 }}>
              💡 <strong style={{ color:"#445" }}>Tips:</strong><br/>
              • Photos auto-compress on upload<br/>
              • Leave price blank → shows as custom quote<br/>
              • Max {MAX_PHOTOS} photos total
            </p>
          </div>
        </div>

        {/* Grid */}
        <div>
          <h3 style={{ color:"#8ab4c8", fontFamily:"'Orbitron',sans-serif",
            fontSize:"0.85rem", letterSpacing:"0.15em", marginBottom:"1.25rem",
            borderBottom:"1px solid rgba(212,0,255,0.12)", paddingBottom:"0.75rem" }}>
            GALLERY ({items.length} items)
          </h3>
          {items.length === 0 ? (
            <div style={{ color:"#334", padding:"3rem", textAlign:"center",
              border:"1px dashed rgba(255,255,255,0.05)", fontSize:"0.9rem" }}>
              No photos yet — add your first piece above!
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"1rem" }}>
              {items.map(item => (
                <div key={item.id}
                  style={{ background:"#0d0d18",
                    border:`1px solid ${editId===item.id ? "rgba(212,0,255,0.5)" : "rgba(255,255,255,0.04)"}`,
                    overflow:"hidden" }}>
                  <div style={{ position:"relative", paddingBottom:"75%" }}>
                    <img src={item.src} alt={item.title}
                      style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <div style={{ padding:"0.6rem 0.75rem" }}>
                    <p style={{ color:"#889", fontSize:"0.8rem", fontFamily:"'Orbitron',sans-serif",
                      marginBottom:"0.4rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {item.title}
                    </p>
                    {item.price && <p style={{ color:"#a87", fontSize:"0.75rem", marginBottom:"0.5rem" }}>{item.price}</p>}
                    <div style={{ display:"flex", gap:"0.4rem" }}>
                      <button onClick={() => startEdit(item)}
                        style={{ flex:1, padding:"0.35rem", background:"rgba(212,0,255,0.12)",
                          border:"1px solid rgba(212,0,255,0.25)", color:"#d4a",
                          cursor:"pointer", fontSize:"0.7rem", letterSpacing:"0.05em" }}>
                        EDIT
                      </button>
                      <button onClick={() => remove(item.id)}
                        style={{ flex:1, padding:"0.35rem", background:"rgba(255,50,0,0.1)",
                          border:"1px solid rgba(255,50,0,0.2)", color:"#f64",
                          cursor:"pointer", fontSize:"0.7rem", letterSpacing:"0.05em" }}>
                        REMOVE
                      </button>
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

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("public");
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const clicks = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch(e) {}
    setLoaded(true);
  }, []);

  const handleFooterClick = () => {
    clicks.current++;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clicks.current = 0; }, 2000);
    if (clicks.current >= 5) { clicks.current = 0; setView("login"); }
  };

  if (!loaded) return (
    <div style={{ minHeight:"100vh", background:"#06060a", display:"flex",
      alignItems:"center", justifyContent:"center", color:"#8ab4c8",
      fontFamily:"'Orbitron',sans-serif", letterSpacing:"0.3em", fontSize:"0.9rem" }}>
      LOADING…
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Cinzel:wght@400;700&family=Raleway:wght@300;400;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#06060a; color:#e0e0e8; font-family:'Raleway',sans-serif; overflow-x:hidden; }
        body::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:linear-gradient(rgba(212,0,255,0.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(212,0,255,0.03) 1px,transparent 1px);
          background-size:30px 30px; }
        @keyframes flicker { 0%{filter:drop-shadow(0 0 4px #ff4400) brightness(0.9);}
          100%{filter:drop-shadow(0 0 18px #ff8c00) brightness(1.3);} }
        @keyframes gradShift { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
        @media(max-width:700px){
          .admin-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ── HERO ── */}
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", textAlign:"center",
          padding:"2rem 2rem 6rem",
          background:"radial-gradient(ellipse at 25% 25%,rgba(212,0,255,0.12) 0%,transparent 55%), radial-gradient(ellipse at 75% 75%,rgba(255,68,0,0.14) 0%,transparent 55%), #06060a",
          position:"relative", overflow:"hidden" }}>

          {/* Fire horse fire */}
          <div style={{ fontSize:"3rem", marginBottom:"1.5rem" }}>
            <span style={{ animation:"flicker 1.4s ease-in-out infinite alternate" }}>🔥</span>
            {" "}
            <span style={{ filter:"drop-shadow(0 0 14px rgba(138,180,200,0.7))", fontSize:"3.2rem" }}>🐴</span>
            {" "}
            <span style={{ animation:"flicker 1.6s ease-in-out infinite alternate" }}>🔥</span>
          </div>

          {/* Main title */}
          <h1 style={{ fontFamily:"'Orbitron',sans-serif", fontWeight:900,
            fontSize:"clamp(2.2rem,9vw,5.5rem)", lineHeight:1.05, letterSpacing:"0.04em",
            background:"linear-gradient(135deg,#ffffff 0%,#8ab4c8 25%,#d400ff 55%,#ff4400 85%,#ffaa00 100%)",
            backgroundSize:"200% 200%",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            filter:"drop-shadow(0 0 30px rgba(212,0,255,0.35))",
            animation:"gradShift 5s ease infinite" }}>
            MUSTANG<br/>METAL<br/>CREATIONS
          </h1>

          {/* Tagline */}
          <p style={{ fontFamily:"'Cinzel',serif", letterSpacing:"0.4em", color:"#66fcf1",
            marginTop:"1.25rem", fontSize:"clamp(0.75rem,2vw,1rem)", fontWeight:700,
            textShadow:"0 0 12px rgba(102,252,241,0.5)" }}>
            FORGED IN FIRE · BUILT TO LAST
          </p>

          {/* Divider */}
          <div style={{ width:220, height:2, margin:"2rem auto",
            background:"linear-gradient(90deg,transparent,#d400ff,#ff4400,transparent)",
            boxShadow:"0 0 12px rgba(212,0,255,0.4)" }} />

          {/* Description */}
          <p style={{ color:"#a0b4c8", maxWidth:520, lineHeight:1.8,
            fontSize:"clamp(0.95rem,2vw,1.1rem)", fontWeight:300 }}>
            Custom metal furniture, mobile welding, and one-of-a-kind home furnishings crafted in Southern Oregon.
          </p>

          {/* CTA */}
          <a href="#gallery"
            style={{ display:"inline-block", marginTop:"2.5rem", padding:"1rem 2.5rem",
              fontFamily:"'Cinzel',serif", letterSpacing:"0.2em", textTransform:"uppercase",
              color:"#fff", border:"2px solid #d400ff", textDecoration:"none",
              background:"transparent", fontSize:"0.9rem", fontWeight:700,
              boxShadow:"0 0 20px rgba(212,0,255,0.2)", transition:"all 0.3s" }}
            onMouseOver={e => { e.target.style.background="linear-gradient(135deg,#d400ff,#ff4400)"; e.target.style.borderColor="transparent"; e.target.style.boxShadow="0 0 30px rgba(255,68,0,0.5)"; }}
            onMouseOut={e => { e.target.style.background="transparent"; e.target.style.borderColor="#d400ff"; e.target.style.boxShadow="0 0 20px rgba(212,0,255,0.2)"; }}>
            View Our Work
          </a>

          {/* Services strip */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0,
            display:"flex", justifyContent:"center", gap:"3rem", padding:"1.25rem",
            background:"rgba(5,5,12,0.88)", backdropFilter:"blur(8px)",
            borderTop:"1px solid rgba(212,0,255,0.12)", flexWrap:"wrap" }}>
            {["🔧 Mobile Welding","🏠 Custom Furnishings","⚡ Metal Fabrication"].map(s => (
              <span key={s} style={{ color:"#8ab4c8", fontSize:"0.85rem",
                letterSpacing:"0.15em", fontWeight:600 }}>{s}</span>
            ))}
          </div>
        </div>

        {/* ── GALLERY SECTION ── */}
        {view === "public" && (
          <div id="gallery" style={{ background:"#06060a", padding:"5rem 1.5rem" }}>
            <h2 style={{ fontFamily:"'Orbitron',sans-serif", textAlign:"center",
              fontSize:"clamp(1.6rem,4vw,2.5rem)", color:"#8ab4c8",
              letterSpacing:"0.1em", marginBottom:"0.5rem",
              textShadow:"0 0 20px rgba(138,180,200,0.3)" }}>
              Our Work
            </h2>
            <p style={{ textAlign:"center", color:"#334455", letterSpacing:"0.3em",
              fontSize:"0.75rem", textTransform:"uppercase", marginBottom:"3rem" }}>
              Custom Pieces · Each One Unique
            </p>
            <Gallery items={items} />
          </div>
        )}

        {view === "login" && (
          <div style={{ background:"#06060a", paddingBottom:"3rem" }}>
            <Login onLogin={() => setView("admin")} />
          </div>
        )}

        {view === "admin" && (
          <Admin items={items} setItems={setItems} onLogout={() => setView("public")} />
        )}

        {/* ── CONTACT ── */}
        {view === "public" && (
          <div style={{ background:"#0a0a14", borderTop:"1px solid rgba(212,0,255,0.1)",
            padding:"5rem 1.5rem", textAlign:"center" }}>
            <h2 style={{ fontFamily:"'Orbitron',sans-serif", color:"#8ab4c8",
              fontSize:"clamp(1.4rem,3vw,2rem)", letterSpacing:"0.1em", marginBottom:"2.5rem",
              textShadow:"0 0 20px rgba(138,180,200,0.3)" }}>Get In Touch</h2>
            <div style={{ display:"flex", justifyContent:"center", gap:"1.5rem",
              flexWrap:"wrap", maxWidth:900, margin:"0 auto" }}>
              {[
                { label:"Contact", val:"Kris Marie" },
                { label:"Phone", val:"541-295-4498", href:"tel:5412954498" },
                { label:"Email", val:"mustangmetalc@gmail.com", href:"mailto:mustangmetalc@gmail.com" },
                { label:"Website", val:"mustangmetal.shop", href:"https://mustangmetal.shop" },
              ].map(c => (
                <div key={c.label}
                  style={{ background:"#111827", border:"1px solid rgba(255,255,255,0.05)",
                    padding:"1.25rem 1.75rem", minWidth:160, flex:1, maxWidth:240,
                    transition:"border-color 0.3s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor="rgba(212,0,255,0.4)"}
                  onMouseOut={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}>
                  <p style={{ color:"#334455", fontSize:"0.65rem", letterSpacing:"0.3em",
                    textTransform:"uppercase", marginBottom:"0.5rem" }}>{c.label}</p>
                  {c.href
                    ? <a href={c.href} style={{ color:"#8ab4c8", textDecoration:"none",
                        fontFamily:"'Cinzel',serif", fontSize:"0.9rem", transition:"color 0.2s" }}
                        onMouseOver={e => e.target.style.color="#d400ff"}
                        onMouseOut={e => e.target.style.color="#8ab4c8"}>{c.val}</a>
                    : <p style={{ color:"#8ab4c8", fontFamily:"'Cinzel',serif", fontSize:"0.9rem" }}>{c.val}</p>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER (5-click admin trigger) ── */}
        <footer onClick={handleFooterClick}
          style={{ textAlign:"center", padding:"2rem 1rem",
            background:"#040408", borderTop:"1px solid rgba(255,255,255,0.03)",
            cursor:"default" }}>
          <p style={{ color:"#1a1a2a", fontSize:"0.78rem", letterSpacing:"0.15em",
            userSelect:"none" }}>
            © 2026 Mustang Metal Creations · Southern Oregon · All Rights Reserved
          </p>
        </footer>

      </div>
    </>
  );
}
