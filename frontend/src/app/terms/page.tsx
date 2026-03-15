import React from 'react';

export default function TermsAndConditionsPage() {
  return (
    // Container: max-w-800px, margin 40px auto (my-10), padding 20px (p-5), line-height 1.6, color #333
    <div className="max-w-[800px] mx-auto my-10 p-5 leading-[1.6] text-[#333]">
      
      {/* Heading: size 2.5rem, bold, mb 20px (mb-5), color #002f34 */}
      <h1 className="text-[2.5rem] font-bold mb-5 text-[#002f34]">Terms and Conditions</h1>
      
      {/* Paragraphs: mb 15px */}
      <p className="mb-[15px]">
        Welcome to Rentza (“Company,” “we,” “us,” or “our”).
      </p>
      <p className="mb-[15px]">
        These Terms and Conditions (“Terms”) govern your access to and use of
        Rentza, a C2C (Customer-to-Customer) rental platform where users can
        list items for rent or rent items from others.
      </p>
      <p className="mb-[15px]">
        By accessing or using our platform, you agree to these Terms.
      </p>

      {/* Subheading: size 1.5rem, bold, mt 30px, mb 10px (mb-2.5), color #002f34 */}
      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">1. Eligibility</h2>
      
      {/* List: disc style, left margin 20px (ml-5), mb 15px */}
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">You must be at least 18 years old to use Rentza.</li>
        <li className="mb-[5px]">
          You agree that all information provided (such as name, contact, and
          product details) is accurate, complete, and up to date.
        </li>
        <li className="mb-[5px]">
          Lenders must have the legal ownership and rights to list and rent
          out the items they upload.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">2. Listings and AI Moderation</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Lenders can list items for rent by providing accurate descriptions,
          images, and prices.
        </li>
        <li className="mb-[5px]">
          Rentza uses AI-powered content moderation to detect and block
          inappropriate or illegal content, such as nudity, violence, hate
          symbols, or restricted items.
        </li>
        <li className="mb-[5px]">
          Listings flagged by AI or manual review may be rejected or removed
          without notice.
        </li>
        <li className="mb-[5px]">
          Repeated violations may result in account suspension or permanent
          removal.
        </li>
        <li className="mb-[5px]">
          Rentza does not guarantee the accuracy, legality, or safety of
          listings.
        </li>
        <li className="mb-[5px]">
          By submitting a listing, you grant Rentza permission to display and
          promote your content (e.g., on social media) for marketing purposes.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">3. Renting Products</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Users can rent items directly from other users (lenders) listed on
          Rentza.
        </li>
        <li className="mb-[5px]">
          Renters must inspect items upon receipt to ensure they match the
          description.
        </li>
        <li className="mb-[5px]">
          Renters are responsible for returning items in the same condition.
        </li>
        <li className="mb-[5px]">
          Any loss, damage, or theft during the rental period is the renter’s
          responsibility.
        </li>
        <li className="mb-[5px]">
          Rentza is not responsible for any disputes, damages, or
          miscommunication between lenders and renters.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">4. Payments</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Rentza does not handle or process payments between lenders and
          renters.
        </li>
        <li className="mb-[5px]">
          All rental-related payments (fees, deposits, damages, etc.) are
          managed directly between users.
        </li>
        <li className="mb-[5px]">
          Rentza only processes online payments for premium or paid packages.
        </li>
        <li className="mb-[5px]">
          Rentza is not responsible for any payment disputes or losses between
          users.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">5. Limitation of Liability</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Rentza provides the platform “as is” and does not guarantee
          uninterrupted or error-free service.
        </li>
        <li className="mb-[5px]">
          Rentza is not liable for product quality, delivery issues, damages,
          or user disputes.
        </li>
        <li className="mb-[5px]">
          Since Rentza does not charge service fees, our total liability to
          users is zero.
        </li>
        <li className="mb-[5px]">
          Users agree to use the platform at their own risk and verify the
          authenticity of listings and users independently.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">6. Intellectual Property</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Users retain ownership of their uploaded content (e.g., photos,
          product descriptions).
        </li>
        <li className="mb-[5px]">
          By uploading content, users grant Rentza a non-exclusive,
          royalty-free license to display and promote their listings on the
          platform and social media for marketing purposes.
        </li>
        <li className="mb-[5px]">
          The Rentza logo, name, and platform design are owned by Rentza and
          may not be copied or used without written permission.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">7. Dispute Resolution</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Rentza serves only as a digital intermediary connecting lenders and
          renters.
        </li>
        <li className="mb-[5px]">
          All rental-related disputes must be resolved directly between the
          involved parties.
        </li>
        <li className="mb-[5px]">
          Rentza may, at its sole discretion, suspend or remove accounts
          involved in repeated or unresolved disputes, with or without prior
          notice.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">8. Termination</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">
          Rentza reserves the right to suspend or terminate any account that
          violates these Terms or misuses the platform.
        </li>
        <li className="mb-[5px]">
          Such actions may occur with or without prior notice, at Rentza’s
          discretion.
        </li>
      </ul>

      <h2 className="text-[1.5rem] font-bold mt-[30px] mb-2.5 text-[#002f34]">9. Amendments</h2>
      <ul className="list-disc ml-5 mb-[15px]">
        <li className="mb-[5px]">Rentza may update or modify these Terms at any time.</li>
        <li className="mb-[5px]">
          Continued use of the platform after updates constitutes your
          acceptance of the new Terms.
        </li>
      </ul>
    </div>
  );
}