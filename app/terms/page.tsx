export default function TermsPage() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-6">Terms of Service</h1>
      <p className="text-[#6B7280] mb-4">
        Welcome to JeffBen Systems. By using our application, you agree to these terms.
      </p>
      <div className="space-y-4 text-sm text-slate-500">
        <p>1. Acceptance of Terms: These terms govern your use of the transit intelligence platform.</p>
        <p>2. User Responsibilities: You must use the system in accordance with all local transit regulations.</p>
        <p>3. Service Availability: While we strive for 99.9% uptime, we do not guarantee continuous access.</p>
      </div>
    </main>
  );
}
