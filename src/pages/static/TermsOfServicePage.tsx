import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-zinc-100">Terms of Service</h1>
      
      <div className="space-y-8 text-zinc-300">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">1. Independent Contractors</h2>
          <p>
            Workers on this platform are independent contractors and are NOT employees of Workers Guild. 
            The platform's role is solely to connect clients with independent workers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">2. Limitation of Liability</h2>
          <p className="mb-2">Workers Guild is NOT responsible for:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li>The quality, safety, or legality of the work performed.</li>
            <li>Any damages to property or self that occur during a job.</li>
            <li>Any injuries sustained by the worker or the client.</li>
            <li>Any theft or loss of items.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">3. User Responsibility</h2>
          <p>
            Users engage services at their own risk. It is the responsibility of the client to 
            verify the suitability of the worker for the required tasks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">4. Payment and Escrow</h2>
          <p>
            The platform controls the holding and release of payments. Payment for a job is held securely 
            in escrow when a client makes a payment, and is only released after the job has been completed 
            and mutually confirmed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">5. Disputes</h2>
          <p>
            In the event of a disagreement, users may raise a dispute. Disputes are reviewed and handled 
            by platform administrators. The decision made by administrators regarding payment release or 
            refunds is final.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">6. Platform Fees</h2>
          <p>
            The platform fee charged for facilitating the connection and securing the payment is non-refundable.
          </p>
        </section>
      </div>
    </div>
  );
}
