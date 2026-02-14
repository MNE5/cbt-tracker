"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

interface Entry {
  id: number; created_at: string; situation: string; automatic_thought: string;
  emotion: string; emotion_intensity: number; cognitive_distortion: string;
  rational_response: string; outcome: string;
}

const COGNITIVE_DISTORTIONS = [
  "All-or-Nothing — Seeing things as black or white, no middle ground",
  "Overgeneralizing — One bad event means everything will go wrong",
  "Catastrophizing — Expecting the worst possible outcome",
  "Mind Reading — Assuming you know what others think",
  "Fortune Telling — Predicting negative outcomes without evidence",
  "Mental Filter — Focusing only on negatives, ignoring positives",
  "Discounting Positives — Dismissing good things that happen",
  "Emotional Reasoning — Feelings are facts (I feel it, so it must be true)",
  "Should Statements — Rigid rules about how things should be",
  "Labeling — Calling yourself or others harsh names",
  "Personalizing — Blaming yourself for things outside your control",
  "Blaming Others — It's always someone else's fault",
];

export default function DashboardPage() {
    const getDistortionName = (distortion: string) => {
        const parts = distortion.split(/\s*\u2014\s*/);
          return parts[0] || distortion;
        };
  
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [cognitiveDistortion, setCognitiveDistortion] = useState("");
  const [rationalResponse, setRationalResponse] = useState("");
  const [outcome, setOutcome] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Entry>>({});

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) { router.replace("/auth/login"); return; }
      setUserEmail(data.session.user.email ?? null);
      setChecking(false);
      fetchEntries();
    };
    checkSession();
  }, [router]);

  const fetchEntries = async () => {
    const { data, error } = await supabase.from("entries").select("*").order("created_at", { ascending: true });
    if (!error && data) setEntries(data as Entry[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.from("entries").insert({ situation, automatic_thought: automaticThought, emotion, emotion_intensity: emotionIntensity, cognitive_distortion: cognitiveDistortion, rational_response: rationalResponse, outcome });
    setLoading(false);
    if (error) { alert("Error: " + error.message); return; }
    setSituation(""); setAutomaticThought(""); setEmotion(""); setEmotionIntensity(5);
    setCognitiveDistortion(""); setRationalResponse(""); setOutcome(""); setShowForm(false); fetchEntries();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this entry?")) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) { alert("Error deleting: " + error.message); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdate = async (id: number) => {
    const p = { situation: editDraft.situation, automatic_thought: editDraft.automatic_thought, emotion: editDraft.emotion, emotion_intensity: editDraft.emotion_intensity, cognitive_distortion: editDraft.cognitive_distortion, rational_response: editDraft.rational_response, outcome: editDraft.outcome };
    const { error } = await supabase.from("entries").update(p).eq("id", id);
    if (error) { alert("Error updating: " + error.message); return; }
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...(p as Entry) } : e)));
    setEditingId(null); setEditDraft({});
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.replace("/auth/login"); };
  const moodData = entries.map((e) => ({ date: new Date(e.created_at).toLocaleDateString(), intensity: e.emotion_intensity }));

  if (checking) return (<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500 text-lg">Loading dashboard...</p></div>);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/Lumen+Therapy+Collective-+Logo.png" alt="Logo" width={40} height={40} className="rounded-md" />
          <h1 className="text-xl font-bold text-gray-900">Mood Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
                      <a href="/worksheets" className="px-4 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">CBT Worksheets</a>
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button onClick={handleSignOut} className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">Sign out</button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => setShowForm(!showForm)} className="mb-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">{showForm ? "Cancel" : "+ New Entry"}</button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Situation</label><textarea value={situation} onChange={(e) => setSituation(e.target.value)} required placeholder="What happened?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Automatic Thought</label><textarea value={automaticThought} onChange={(e) => setAutomaticThought(e.target.value)} required placeholder="What went through your mind?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Emotion</label><input type="text" value={emotion} onChange={(e) => setEmotion(e.target.value)} required placeholder="e.g., Anxiety" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Intensity: <span className="font-bold text-blue-600">{emotionIntensity}/10</span></label><input type="range" min="1" max="10" value={emotionIntensity} onChange={(e) => setEmotionIntensity(Number(e.target.value))} className="w-full mt-2 accent-blue-600" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cognitive Distortion</label><select value={cognitiveDistortion} onChange={(e) => setCognitiveDistortion(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"><option value="">None / Not sure</option>{COGNITIVE_DISTORTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Rational Response</label><textarea value={rationalResponse} onChange={(e) => setRationalResponse(e.target.value)} required placeholder="A more balanced way to think?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label><textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="How do you feel now?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900" /></div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50">{loading ? "Saving..." : "Save Entry"}</button>
          </form>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No entries yet. Click &quot;+ New Entry&quot; to log your first thought record.</p>
        ) : (
          entries.map((entry) => {
            const isEditing = editingId === entry.id;
            return (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                <p className="text-xs text-gray-400 mb-3">{new Date(entry.created_at).toLocaleString()}</p>
                {isEditing ? (
                  <div className="space-y-2">
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Situation</label><textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" value={editDraft.situation ?? entry.situation} onChange={(e) => setEditDraft((p) => ({ ...p, situation: e.target.value }))} /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Automatic Thought</label><textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" value={editDraft.automatic_thought ?? entry.automatic_thought} onChange={(e) => setEditDraft((p) => ({ ...p, automatic_thought: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="block text-xs font-medium text-gray-700 mb-1">Emotion</label><input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" value={editDraft.emotion ?? entry.emotion} onChange={(e) => setEditDraft((p) => ({ ...p, emotion: e.target.value }))} /></div>
                      <div><label className="block text-xs font-medium text-gray-700 mb-1">Intensity</label><input type="number" min={1} max={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" value={editDraft.emotion_intensity ?? entry.emotion_intensity} onChange={(e) => setEditDraft((p) => ({ ...p, emotion_intensity: Number(e.target.value) }))} /></div>
                    </div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Cognitive Distortion</label><select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" value={editDraft.cognitive_distortion ?? entry.cognitive_distortion ?? ""} onChange={(e) => setEditDraft((p) => ({ ...p, cognitive_distortion: e.target.value }))}><option value="">None / Not sure</option>{COGNITIVE_DISTORTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}</select></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Rational Response</label><textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" value={editDraft.rational_response ?? entry.rational_response} onChange={(e) => setEditDraft((p) => ({ ...p, rational_response: e.target.value }))} /></div>
                    <div><label className="block text-xs font-medium text-gray-700 mb-1">Outcome</label><textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" value={editDraft.outcome ?? entry.outcome ?? ""} onChange={(e) => setEditDraft((p) => ({ ...p, outcome: e.target.value }))} /></div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button type="button" onClick={() => { setEditingId(null); setEditDraft({}); }} className="px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                      <button type="button" onClick={() => handleUpdate(entry.id)} className="px-3 py-1 text-xs font-semibold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition">Save</button>
                    </div>
                  </div>
                ) : (
                  <>                    <div className="space-y-2">
                      <p className="text-gray-900"><span className="font-semibold">Situation:</span> {entry.situation}</p>
                      <p className="text-gray-900"><span className="font-semibold">Automatic Thought:</span> {entry.automatic_thought}</p>
                      <p className="text-gray-900"><span className="font-semibold">Emotion:</span> {entry.emotion}<span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{entry.emotion_intensity}/10</span></p>
                      {entry.cognitive_distortion && (<p className="text-gray-900"><span className="font-semibold">Distortion:</span> {getDistortionName(entry.cognitive_distortion)}</p>)}
                      <p className="text-gray-900"><span className="font-semibold">Rational Response:</span> {entry.rational_response}</p>
                      {entry.outcome && (<p className="text-gray-900"><span className="font-semibold">Outcome:</span> {entry.outcome}</p>)}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => { setEditingId(entry.id); setEditDraft(entry); }} className="px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">Edit</button>
                      <button type="button" onClick={() => handleDelete(entry.id)} className="px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Delete</button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}

        {moodData.length > 0 && (
          <section className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-md font-semibold text-gray-900 mb-2">Emotion Intensity Over Time</h3>
            <p className="text-xs text-gray-500 mb-4">Each point is an entry&apos;s emotion intensity (1–10) on the date it was logged.</p>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 10 }} stroke="#6B7280" />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: any) => [`${value}/10`, "Intensity"]} />
                  <Line type="monotone" dataKey="intensity" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
