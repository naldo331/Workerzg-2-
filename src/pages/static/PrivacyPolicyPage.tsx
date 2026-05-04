import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-zinc-100">Privacy Policy</h1>
      
      <div className="space-y-8 text-zinc-300">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">1. Data Collected</h2>
          <p className="mb-2">We collect the following personal information to facilitate services on our platform:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>Name</li>
            <li>Phone number</li>
            <li>Account information (Email address, Role)</li>
            <li>Images uploaded to the platform (e.g., profile pictures, dispute evidence)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">2. Purpose of Collection</h2>
          <p className="mb-2">Your data is used strictly for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>To match clients with suitable independent workers.</li>
            <li>To process jobs and facilitate communication after payments are secured.</li>
            <li>To handle and resolve disputes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">3. Data Protection</h2>
          <p>
            Your data is stored securely using industry-standard measures. We do not sell your personal 
            data to third parties under any circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">4. Image Handling</h2>
          <p>
            Images uploaded as evidence for disputes are temporarily stored and are securely deleted 
            after the dispute has been fully resolved.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">5. Compliance</h2>
          <p>
            Our data practices align with the principles of the Jamaica Data Protection Act. 
            We are committed to maintaining the privacy and security of your information.
          </p>
        </section>
      </div>
    </div>
  );
}
