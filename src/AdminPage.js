import { useState } from 'react';
import { usePresentations } from './usePresentations';

export default function AdminPage() {
  const {
    presentations, loading, error,
    create, updateSlides, updateLogo, duplicate, remove,
  } = usePresentations();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editSlides, setEditSlides] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // ─── Create flow state ───
  const [createStep, setCreateStep] = useState(1); // 1=name, 2=logo
  const [pendingPres, setPendingPres] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // ─── Create Step 1: Name ───
  const handleCreateName = async () => {
    if (!newName.trim()) return;
    setCreateError('');
    try {
      const pres = await create(newName);
      setPendingPres(pres);
      setCreateStep(2);
      setNewName('');
    } catch (e) {
      setCreateError(e.message);
    }
  };

  // ─── Create Step 2: Logo upload ───
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!pendingPres || !logoFile) return;
    setUploadingLogo(true);
    try {
      // Convert to base64 data URL for storage (simple approach)
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        await updateLogo(pendingPres.id, dataUrl);
        setUploadingLogo(false);
        resetCreateFlow();
      };
      reader.readAsDataURL(logoFile);
    } catch (e) {
      setUploadingLogo(false);
      alert('Logo upload failed: ' + e.message);
    }
  };

  const skipLogo = () => resetCreateFlow();

  const resetCreateFlow = () => {
    setCreateStep(1);
    setPendingPres(null);
    setLogoFile(null);
    setLogoPreview(null);
    setUploadingLogo(false);
  };

  // ─── Logo update for existing presentations ───
  const handleUpdateLogo = async (presId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await updateLogo(presId, ev.target.result);
      } catch (err) {
        alert('Logo update failed: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── Edit ───
  const startEdit = (pres) => {
    setEditingId(pres.id);
    setEditSlides(JSON.parse(JSON.stringify(pres.slides)));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateSlides(editingId, editSlides);
      setEditingId(null);
      setEditSlides(null);
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const updateField = (si, field, value) => {
    const s = [...editSlides];
    s[si] = { ...s[si], [field]: value };
    setEditSlides(s);
  };

  const updateBullet = (si, bi, value) => {
    const s = [...editSlides];
    const bullets = [...(s[si].bullets || [])];
    bullets[bi] = value;
    s[si] = { ...s[si], bullets };
    setEditSlides(s);
  };

  // ─── Slug preview ───
  const slugPreview = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

  // ═══════════════ EDIT MODE ═══════════════
  if (editingId && editSlides) {
    const pres = presentations.find((p) => p.id === editingId);
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="admin-btn admin-btn--ghost" onClick={() => { setEditingId(null); setEditSlides(null); }}>← Back</button>
            <h2 style={{ margin: 0 }}>Editing: {pres?.customer_name}</h2>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={saveEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div className="admin-body" style={{ maxWidth: 900 }}>
          {editSlides.map((slide, si) => (
            <div key={si} className="admin-card admin-slide-editor">
              <span className="admin-slide-badge">Slide {si + 1} — {slide.type}</span>

              {slide.title !== undefined && (
                <label className="admin-field">
                  <span>Title</span>
                  <input value={slide.title} onChange={(e) => updateField(si, 'title', e.target.value)} />
                </label>
              )}
              {slide.subtitle !== undefined && (
                <label className="admin-field">
                  <span>Subtitle</span>
                  <textarea value={slide.subtitle} onChange={(e) => updateField(si, 'subtitle', e.target.value)} rows={2} />
                </label>
              )}
              {slide.intro !== undefined && (
                <label className="admin-field">
                  <span>Intro</span>
                  <textarea value={slide.intro} onChange={(e) => updateField(si, 'intro', e.target.value)} rows={2} />
                </label>
              )}
              {slide.bullets && (
                <div className="admin-field">
                  <span>Bullets</span>
                  {slide.bullets.map((b, bi) => (
                    <textarea key={bi} value={b} onChange={(e) => updateBullet(si, bi, e.target.value)} rows={2} style={{ marginBottom: 6 }} />
                  ))}
                </div>
              )}
              {slide.goal !== undefined && (
                <label className="admin-field">
                  <span>Goal</span>
                  <textarea value={slide.goal} onChange={(e) => updateField(si, 'goal', e.target.value)} rows={2} />
                </label>
              )}
              {slide.strategy !== undefined && (
                <label className="admin-field">
                  <span>Strategy</span>
                  <textarea value={slide.strategy} onChange={(e) => updateField(si, 'strategy', e.target.value)} rows={2} />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════ LIST MODE ═══════════════
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <a href="#/" className="admin-logo">
              <img src="/images/logo-icon-white.png" alt="" style={{ height: 28 }} />
            </a>
            <span className="admin-label">ONSITE AFFILIATE</span>
          </div>
          <h1>Presentation Admin</h1>
          <p className="admin-description">Create and manage customer presentations at onsiteaffiliate.com/p/&lt;customer&gt;</p>
        </div>
      </div>

      {/* Create - Step Flow */}
      <div className="admin-section">
        <h3 className="admin-section-title">Create New Presentation</h3>

        {/* Step indicators */}
        <div className="admin-steps">
          <span className={`admin-step ${createStep >= 1 ? 'admin-step--active' : ''}`}>
            <span className="admin-step__num">1</span> Customer Name
          </span>
          <span className="admin-step__arrow">→</span>
          <span className={`admin-step ${createStep >= 2 ? 'admin-step--active' : ''}`}>
            <span className="admin-step__num">2</span> Upload Logo
          </span>
        </div>

        {createStep === 1 && (
          <>
            <div className="admin-create-row">
              <input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setCreateError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateName()}
                placeholder="Customer Name (e.g., Nike)"
                className="admin-input"
              />
              <button className="admin-btn admin-btn--primary" onClick={handleCreateName}>Next →</button>
            </div>
            {newName.trim() && (
              <p className="admin-slug-preview">
                URL: onsiteaffiliate.com/p/<strong>{slugPreview}</strong>
              </p>
            )}
            {createError && <p className="admin-error">{createError}</p>}
          </>
        )}

        {createStep === 2 && pendingPres && (
          <div className="admin-logo-upload">
            <p className="admin-logo-label">
              Upload <strong>{pendingPres.customer_name}</strong>'s logo
            </p>
            <p className="admin-muted" style={{ marginBottom: 16 }}>
              Recommended: PNG or SVG, transparent background, at least 200px wide
            </p>

            <div className="admin-logo-zone">
              {logoPreview ? (
                <div className="admin-logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                  <button className="admin-btn admin-btn--ghost" onClick={() => { setLogoFile(null); setLogoPreview(null); }}>
                    Remove
                  </button>
                </div>
              ) : (
                <label className="admin-logo-dropzone">
                  <input type="file" accept="image/*" onChange={handleLogoSelect} style={{ display: 'none' }} />
                  <span className="admin-logo-dropzone__icon">📁</span>
                  <span>Click to select logo file</span>
                  <span className="admin-muted">PNG, SVG, JPG — max 2MB</span>
                </label>
              )}
            </div>

            <div className="admin-create-row" style={{ marginTop: 16 }}>
              <button className="admin-btn admin-btn--ghost" onClick={skipLogo}>Skip</button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleLogoUpload}
                disabled={!logoFile || uploadingLogo}
              >
                {uploadingLogo ? 'Uploading…' : 'Upload & Finish'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="admin-section">
        <h3 className="admin-section-title">Presentations ({presentations.length})</h3>

        {loading && <p className="admin-muted">Loading…</p>}
        {error && <p className="admin-error">{error}</p>}

        {!loading && presentations.length === 0 && (
          <div className="admin-empty">
            <p>No presentations yet</p>
            <p className="admin-muted">Create your first one above.</p>
          </div>
        )}

        <div className="admin-list">
          {presentations.map((pres) => (
            <div key={pres.id} className="admin-card admin-pres-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {pres.logo_url ? (
                  <img src={pres.logo_url} alt="" className="admin-pres-logo" />
                ) : (
                  <div className="admin-pres-logo-placeholder">
                    {pres.customer_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4>{pres.customer_name}</h4>
                  <p className="admin-slug">/p/{pres.slug}</p>
                  <p className="admin-muted" style={{ fontSize: '0.72rem' }}>
                    Created {new Date(pres.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="admin-actions">
                <a href={`#/p/${pres.slug}`} className="admin-btn admin-btn--accent">View</a>
                <button className="admin-btn admin-btn--ghost" onClick={() => startEdit(pres)}>Edit</button>
                <label className="admin-btn admin-btn--ghost" style={{ cursor: 'pointer' }}>
                  Logo
                  <input type="file" accept="image/*" onChange={(e) => handleUpdateLogo(pres.id, e)} style={{ display: 'none' }} />
                </label>
                <button className="admin-btn admin-btn--ghost" onClick={() => duplicate(pres)}>Duplicate</button>
                <button className="admin-btn admin-btn--danger" onClick={() => { if (window.confirm('Delete?')) remove(pres.id); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
