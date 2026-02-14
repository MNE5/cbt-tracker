"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface ThoughtRecord {
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  cognitiveDistortion: string;
  balancedThought: string;
  newEmotionIntensity: number;
}

interface DailyActivity {
  domain: string;
  hours: string;
  moodBefore: number;
  moodAfter: number;
}

const DOMAINS = [
  "Work/School",
  "Family",
  "Social",
  "Self-Care",
  "Exercise",
  "Hobbies",
  "Rest",
  "Other"
];

const VALUES_CATEGORIES = [
  { name: "Family", description: "Relationships with parents, siblings, children" },
  { name: "Relationships", description: "Friendships, romantic partnerships" },
  { name: "Work/Career", description: "Professional goals and growth" },
  { name: "Education", description: "Learning and personal development" },
  { name: "Health", description: "Physical and mental wellbeing" },
  { name: "Spirituality", description: "Faith, meaning, purpose" },
  { name: "Community", description: "Giving back, volunteering" },
  { name: "Recreation", description: "Fun, hobbies, leisure" }
];

const COGNITIVE_DISTORTIONS = [
  "All-or-Nothing Thinking",
  "Overgeneralization",
  "Mental Filter",
  "Disqualifying the Positive",
  "Jumping to Conclusions",
  "Magnification or Minimization",
  "Emotional Reasoning",
  "Should Statements",
  "Labeling",
  "Personalization"
];

export default function WorksheetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"thought-record" | "activity-log" | "values" | "progress">("thought-record");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Thought Record State
  const [thoughtRecord, setThoughtRecord] = useState<ThoughtRecord>({
    situation: "",
    automaticThought: "",
    emotion: "",
    emotionIntensity: 5,
    evidenceFor: "",
    evidenceAgainst: "",
    cognitiveDistortion: "",
    balancedThought: "",
    newEmotionIntensity: 5
  });

  // Daily Activity State
  const [activities, setActivities] = useState<DailyActivity[]>([{
    domain: "Work/School",
    hours: "",
    moodBefore: 5,
    moodAfter: 5
  }]);

  // Values State
  const [values, setValues] = useState<Record<string, { importance: number; action: string }>>({});

  // Progress State
  const [weeklyGoals, setWeeklyGoals] = useState<string[]>(["", "", ""]);
  const [achievements, setAchievements] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setUserEmail(session.user.email || null);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const saveThoughtRecord = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("worksheets").insert({
        user_id: session.user.id,
        type: "thought-record",
        data: thoughtRecord,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      setMessage("Thought record saved!");
      setThoughtRecord({
        situation: "",
        automaticThought: "",
        emotion: "",
        emotionIntensity: 5,
        evidenceFor: "",
        evidenceAgainst: "",
        cognitiveDistortion: "",
        balancedThought: "",
        newEmotionIntensity: 5
      });
    } catch (err) {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const saveActivityLog = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("worksheets").insert({
        user_id: session.user.id,
        type: "activity-log",
        data: { activities, date: new Date().toISOString().split("T")[0] },
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      setMessage("Activity log saved!");
      setActivities([{ domain: "Work/School", hours: "", moodBefore: 5, moodAfter: 5 }]);
    } catch (err) {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const saveValues = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("worksheets").insert({
        user_id: session.user.id,
        type: "values-clarification",
        data: values,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      setMessage("Values saved!");
    } catch (err) {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("worksheets").insert({
        user_id: session.user.id,
        type: "weekly-progress",
        data: { weeklyGoals, achievements, challenges, nextSteps },
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      setMessage("Progress saved!");
      setWeeklyGoals(["", "", ""]);
      setAchievements("");
      setChallenges("");
      setNextSteps("");
    } catch (err) {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const addActivity = () => {
    setActivities([...activities, { domain: "Work/School", hours: "", moodBefore: 5, moodAfter: 5 }]);
  };

  const updateActivity = (index: number, field: keyof DailyActivity, value: string | number) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded" />
            <h1 className="text-xl font-semibold text-gray-800">CBT Worksheets</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="px-4 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">Mood Tracker</a>
            <span className="text-sm text-gray-500">{userEmail}</span>
            <button onClick={handleSignOut} className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("thought-record")}
            className={`px-4 py-2 font-medium rounded-t-lg transition ${activeTab === "thought-record" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Thought Record
          </button>
          <button
            onClick={() => setActiveTab("activity-log")}
            className={`px-4 py-2 font-medium rounded-t-lg transition ${activeTab === "activity-log" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Daily Activity Log
          </button>
          <button
            onClick={() => setActiveTab("values")}
            className={`px-4 py-2 font-medium rounded-t-lg transition ${activeTab === "values" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Values Clarification
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`px-4 py-2 font-medium rounded-t-lg transition ${activeTab === "progress" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Weekly Progress
          </button>
        </div>

        {/* Thought Record */}
        {activeTab === "thought-record" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thought Record</h2>
            <p className="text-gray-600 mb-6">Identify and challenge negative automatic thoughts.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation</label>
                <textarea
                  value={thoughtRecord.situation}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, situation: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Describe the situation that triggered the thought..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Automatic Thought</label>
                <textarea
                  value={thoughtRecord.automaticThought}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, automaticThought: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="What thought went through your mind?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emotion</label>
                  <input
                    type="text"
                    value={thoughtRecord.emotion}
                    onChange={(e) => setThoughtRecord({...thoughtRecord, emotion: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Anxious, Sad, Angry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intensity (1-10): {thoughtRecord.emotionIntensity}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={thoughtRecord.emotionIntensity}
                    onChange={(e) => setThoughtRecord({...thoughtRecord, emotionIntensity: parseInt(e.target.value)})}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence For the Thought</label>
                <textarea
                  value={thoughtRecord.evidenceFor}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, evidenceFor: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="What facts support this thought?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Against the Thought</label>
                <textarea
                  value={thoughtRecord.evidenceAgainst}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, evidenceAgainst: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="What facts contradict this thought?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognitive Distortion</label>
                <select
                  value={thoughtRecord.cognitiveDistortion}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, cognitiveDistortion: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a distortion...</option>
                  {COGNITIVE_DISTORTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balanced Thought</label>
                <textarea
                  value={thoughtRecord.balancedThought}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, balancedThought: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Write a more balanced, realistic thought..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Emotion Intensity (1-10): {thoughtRecord.newEmotionIntensity}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={thoughtRecord.newEmotionIntensity}
                  onChange={(e) => setThoughtRecord({...thoughtRecord, newEmotionIntensity: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <button
                onClick={saveThoughtRecord}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Thought Record"}
              </button>
            </div>
          </div>
        )}

        {/* Daily Activity Log */}
        {activeTab === "activity-log" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Activity Log</h2>
            <p className="text-gray-600 mb-6">Track how different activities affect your mood.</p>
            
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">Activity {index + 1}</span>
                    {activities.length > 1 && (
                      <button
                        onClick={() => removeActivity(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                      <select
                        value={activity.domain}
                        onChange={(e) => updateActivity(index, "domain", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {DOMAINS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours Spent</label>
                      <input
                        type="text"
                        value={activity.hours}
                        onChange={(e) => updateActivity(index, "hours", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mood Before (1-10): {activity.moodBefore}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={activity.moodBefore}
                        onChange={(e) => updateActivity(index, "moodBefore", parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mood After (1-10): {activity.moodAfter}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={activity.moodAfter}
                        onChange={(e) => updateActivity(index, "moodAfter", parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addActivity}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"
              >
                + Add Another Activity
              </button>
              
              <button
                onClick={saveActivityLog}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Activity Log"}
              </button>
            </div>
          </div>
        )}

        {/* Values Clarification */}
        {activeTab === "values" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Values Clarification</h2>
            <p className="text-gray-600 mb-6">Identify what matters most to you and how to live in alignment with your values.</p>
            
            <div className="space-y-4">
              {VALUES_CATEGORIES.map((category) => (
                <div key={category.name} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Importance (1-10): {values[category.name]?.importance || 5}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={values[category.name]?.importance || 5}
                      onChange={(e) => setValues({
                        ...values,
                        [category.name]: {
                          ...values[category.name],
                          importance: parseInt(e.target.value),
                          action: values[category.name]?.action || ""
                        }
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">One action I can take this week:</label>
                    <input
                      type="text"
                      value={values[category.name]?.action || ""}
                      onChange={(e) => setValues({
                        ...values,
                        [category.name]: {
                          ...values[category.name],
                          importance: values[category.name]?.importance || 5,
                          action: e.target.value
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Describe a small action..."
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={saveValues}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Values"}
              </button>
            </div>
          </div>
        )}

        {/* Weekly Progress */}
        {activeTab === "progress" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Progress Tracker</h2>
            <p className="text-gray-600 mb-6">Reflect on your week and plan for the next one.</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Weekly Goals</h3>
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="mb-2">
                    <label className="block text-sm text-gray-600 mb-1">Goal {index + 1}</label>
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => {
                        const updated = [...weeklyGoals];
                        updated[index] = e.target.value;
                        setWeeklyGoals(updated);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Enter a goal for this week..."
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block font-medium text-gray-800 mb-2">Achievements This Week</label>
                <textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What did you accomplish? What went well?"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-800 mb-2">Challenges Faced</label>
                <textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What obstacles did you encounter?"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-800 mb-2">Next Steps</label>
                <textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="What will you focus on next week?"
                />
              </div>
              
              <button
                onClick={saveProgress}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
