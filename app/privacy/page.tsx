export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-6">Privacy Policy</h1>
      <p className="text-slate-600 mb-4">
        Your privacy is important to JeffBen Systems. This policy explains how we handle your data.
      </p>
      <div className="space-y-4 text-sm text-slate-500">
        <p>1. Data Collection: We collect location data strictly for providing nearby transit options and live fleet tracking.</p>
        <p>2. Data Usage: Your location is never shared with third parties for marketing purposes.</p>
        <p>3. Account Deletion: You may request account deletion at any time via the profile settings.</p>
      </div>
    </main>
  );
}
