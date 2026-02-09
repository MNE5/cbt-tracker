"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

interface Entry {
  id: number;
  created_at: string;
  situation: string;
  automatic_thought: string;
  emotion: string;
  emotion_intensity: number;
  cognitive_distortion: string;
  rational_response: string;
  outcome: string;
}

const COGNITIVE_DISTORTIONS = [
  "All or nothing thinking",
  "Arbitrary inference",
  "Catastrophizing",
  "Emotional reasoning",
  "Externalizing",
  "Fortune telling",
  "Mental filter",
  "Personalizing",
  "Self-blame",
  "Mind reading",
  "Should statements",
  "Thought-action fusion",
  "Labeling",
  "Permissive thinking",
  "Hindsight bias",
  "Disqualifying the positive",
  "Jumping to conclusions",
  "Magnification and minimization",
  "Overgeneralization",
  "Social comparison",
];

export default function DashboardPage() {
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
      if (error || !data.session) {
        router.replace("/auth/login");
        return;
      }
      setUserEmail(data.session.user.email ?? null);
      setChecking(false);
      fetchEntries();
    };
    checkSession();
  }, [router]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setEntries(data as Entry[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("entries").insert({
      situation,
      automatic_thought: automaticThought,
      emotion,
      emotion_intensity: emotionIntensity,
      cognitive_distortion: cognitiveDistortion,
      rational_response: rationalResponse,
      outcome,
    });
    setLoading(false);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    setSituation("");
    setAutomaticThought("");
    setEmotion("");
    setEmotionIntensity(5);
    setCognitiveDistortion("");
    setRationalResponse("");
    setOutcome("");
    setShowForm(false);
    fetchEntries();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this entry?");
    if (!confirmed) return;

    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      alert("Error deleting entry: " + error.message);
      return;
    }
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleUpdate = async (id: number) => {
    const payload = {
      situation: editDraft.situation,
      automatic_thought: editDraft.automatic_thought,
      emotion: editDraft.emotion,
      emotion_intensity: editDraft.emotion_intensity,
      cognitive_distortion: editDraft.cognitive_distortion,
      rational_response: editDraft.rational_response,
      outcome: editDraft.outcome,
    };

    const { error } = await supabase
      .from("entries")
      .update(payload)
      .eq("id", id);
    if (error) {
      alert("Error updating entry: " + error.message);
      return;
    }

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...(payload as Entry) } : entry
      )
    );
    setEditingId(null);
    setEditDraft({});
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const moodData = entries.map((entry) => ({
    date: new Date(entry.created_at).toLocaleDateString(),
    intensity: entry.emotion_intensity,
  }));

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/Lumen+Therapy+Collective-+Logo.png"
            alt="Lumen Therapy Collective logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <h1 className="text-xl font-bold text-gray-900">
            Mood Tracker
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button
            onClick={handleSignOut}
            className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          {showForm ? "Cancel" : "+ New Entry"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situation
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                required
                placeholder="What happened? Where were you?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Automatic Thought
              </label>
              <textarea
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                required
                placeholder="What went through your mind?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emotion
                </label>
                <input
                  type="text"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  required
                  placeholder="e.g., Anxiety, Sadness"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intensity:{" "}
                  <span className="font-bold text-blue-600">
                    {emotionIntensity}/10
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotionIntensity}
                  onChange={(e) =>
                    setEmotionIntensity(Number(e.target.value))
                  }
                  className="w-full mt-2 accent-blue-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cognitive Distortion
              </label>
              <select
                value={cognitiveDistortion}
                onChange={(e) => setCognitiveDistortion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              >
                <option value="">None / Not sure</option>
                {COGNITIVE_DISTORTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rational Response
              </label>
              <textarea
                value={rationalResponse}
                onChange={(e) => setRationalResponse(e.target.value)}
                required
                placeholder="A more balanced way to think about this?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outcome
              </label>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="How do you feel now?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[70px] text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </form>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Past Entries
        </h2>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No entries yet. Click &quot;+ New Entry&quot; to log your first
            thought record.
          </p>
        ) : (
          entries.map((entry) => {
            const isEditing = editingId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4"
              >
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(entry.created_at).toLocaleString()}
                </p>

                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Situation
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        value={editDraft.situation ?? entry.situation}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            situation: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Automatic Thought
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        value={
                          editDraft.automatic_thought ??
                          entry.automatic_thought
                        }
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            automatic_thought: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Emotion
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                          value={editDraft.emotion ?? entry.emotion}
                          onChange={(e) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              emotion: e.target.value,
                            }