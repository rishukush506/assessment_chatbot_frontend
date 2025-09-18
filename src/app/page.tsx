"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConsentPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consent) {
      router.push("/chatbot"); // go to chatbot page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-6">
      <div className="max-w-3xl w-full bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Consent Form for Study Participation
        </h1>

        <div className="space-y-6 text-gray-300">
          <p>
            You are invited to take part in a research study exploring{" "}
            <span className="font-semibold">
              financial persona discovery through chatbot interaction
            </span>
            . Participation is entirely voluntary. No personally identifiable
            information (PII) will be collected. All responses will remain
            anonymous, and data will be used solely for research purposes.
          </p>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              Data Storage and Security:
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-semibold">Storage:</span> The data will be
                stored securely on a password-protected machine of the primary
                researcher.
              </li>
              <li>
                <span className="font-semibold">Access:</span> Only individuals
                involved in the research project will have access to the data.
              </li>
              <li>
                <span className="font-semibold">Retention:</span> The data will
                be retained after the completion of the research project. Later
                it will be made public for future research usage by the
                community.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Your Rights:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-semibold">Withdrawal of Consent:</span>{" "}
                You have the right to withdraw your consent in the next 30 days
                from collecting the data by mentioning your unique User ID which
                will be mentioned in the end after submitting feedback. If you
                withdraw your consent, we will cease using your data and will
                delete it within 30 days.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact Information:</h2>
            <p>
              If you have any questions or concerns about this consent form or
              the research project, please contact:
            </p>
            <p className="mt-2">
              <span className="font-semibold">Name:</span> Mr. Rishabh Kushwah
              <br />
              <span className="font-semibold">Email:</span>{" "}
              <a className="text-blue-400 hover:underline">
                rishabh.kushwah@tcs.com
              </a>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={() => setConsent(!consent)}
              className="w-4 h-4 text-blue-500 border-gray-600 rounded focus:ring-blue-500"
            />
            <span>I consent to participate in this study.</span>
          </label>

          <button
            type="submit"
            disabled={!consent}
            className={`w-full py-2 px-4 rounded-lg shadow-md font-semibold transition 
              ${
                consent
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              }
            `}
          >
            Next → Chatbot
          </button>
        </form>
      </div>
    </div>
  );
}
