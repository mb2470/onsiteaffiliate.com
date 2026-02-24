import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import DEFAULT_SLIDES from './defaultSlides';

// ─── Fetch a single presentation by slug (public-facing) ───
export function usePresentation(slug) {
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from('presentations')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        else setPresentation(data);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { presentation, loading, error };
}

// ─── Full CRUD for admin panel ───
export function usePresentations() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all presentations
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('presentations')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) setError(err.message);
    else setPresentations(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Create a new presentation
  const create = async (customerName) => {
    const slug = customerName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '');

    // Check for duplicates
    const existing = presentations.find((p) => p.slug === slug);
    if (existing) throw new Error('A presentation with that URL already exists.');

    const { data, error: err } = await supabase
      .from('presentations')
      .insert({
        customer_name: customerName.trim(),
        slug,
        slides: DEFAULT_SLIDES,
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    setPresentations((prev) => [data, ...prev]);
    return data;
  };

  // Update slides
  const updateSlides = async (id, slides) => {
    const { error: err } = await supabase
      .from('presentations')
      .update({ slides })
      .eq('id', id);

    if (err) throw new Error(err.message);
    setPresentations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, slides } : p))
    );
  };

  // Update logo
  const updateLogo = async (id, logoUrl) => {
    const { error: err } = await supabase
      .from('presentations')
      .update({ logo_url: logoUrl })
      .eq('id', id);

    if (err) throw new Error(err.message);
    setPresentations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, logo_url: logoUrl } : p))
    );
  };

  // Update customer name (and optionally slug)
  const updateName = async (id, customerName) => {
    const slug = customerName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '');

    const { error: err } = await supabase
      .from('presentations')
      .update({ customer_name: customerName.trim(), slug })
      .eq('id', id);

    if (err) throw new Error(err.message);
    setPresentations((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, customer_name: customerName.trim(), slug } : p
      )
    );
  };

  // Duplicate
  const duplicate = async (presentation) => {
    const newName = presentation.customer_name + ' (Copy)';
    const newSlug = presentation.slug + '-copy-' + Date.now().toString(36);

    const { data, error: err } = await supabase
      .from('presentations')
      .insert({
        customer_name: newName,
        slug: newSlug,
        slides: presentation.slides,
        logo_url: presentation.logo_url || null,
      })
      .select()
      .single();

    if (err) throw new Error(err.message);
    setPresentations((prev) => [data, ...prev]);
    return data;
  };

  // Delete
  const remove = async (id) => {
    const { error: err } = await supabase
      .from('presentations')
      .delete()
      .eq('id', id);

    if (err) throw new Error(err.message);
    setPresentations((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    presentations,
    loading,
    error,
    create,
    updateSlides,
    updateLogo,
    updateName,
    duplicate,
    remove,
    refetch: fetchAll,
  };
}
