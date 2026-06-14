import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "Professional standards for participants, faculty, and staff at California Dental Meeting programs.",
};

export default function CodeOfConductPage(): React.ReactElement {
  return (
    <LegalPage
      eyebrow="Community"
      title="Code of Conduct"
      intro="The professional standards we ask of every participant, speaker, and staff member at California Dental Meeting programs."
      updated="June 2026"
      sections={[
        {
          heading: "Professional Respect",
          paragraphs: [
            "Treat all participants, faculty, staff, and patients with respect, courtesy, and professionalism at all times.",
          ],
        },
        {
          heading: "Anti-Harassment & Non-Discrimination",
          paragraphs: [
            "California Dental Meeting does not tolerate harassment or discrimination of any kind. Everyone is entitled to a safe, inclusive learning environment.",
          ],
        },
        {
          heading: "Clinical & Patient Safety",
          paragraphs: [
            "Where a program involves patient care, participants must follow all clinical, safety, sterilization, and supervision protocols, and act only within their scope of practice and the program's supervised structure.",
          ],
        },
        {
          heading: "Academic Integrity",
          paragraphs: [
            "Course materials are provided for participants' personal educational use. Please respect faculty intellectual property and applicable copyright.",
          ],
        },
        {
          heading: "Grievances & Complaints",
          paragraphs: [
            "Participants may submit complaints regarding course administration, educational quality, facilities, faculty performance, attendance verification, or continuing-education documentation. Complaints may be sent to California Dental Meeting at ray.yabardental@gmail.com and will be reviewed and addressed in a timely and professional manner.",
          ],
        },
      ]}
    />
  );
}
