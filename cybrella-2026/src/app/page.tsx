// src/app/page.tsx
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/mouse-effects/CustomCursor";
import CursorHighlight from "@/components/mouse-effects/CursorHighlight";
import EventsSection from "@/components/EventsSection";
import SponsorsSection from "@/components/SponsorsSection";
import HeroSection from "@/components/HeroSection";
import TechShowcaseSection from "@/components/TechShowcaseSection";

// Force dynamic rendering so we see new events immediately after refresh
export const dynamic = "force-dynamic";

export default async function Home() {
    // 1. Fetch Events
    const eventsRef = collection(db, "events");
    // If orderBy fails initially due to missing index, remove the orderBy wrapper temporarily
    const qEvents = query(eventsRef, orderBy("createdAt", "desc"));
    const eventSnap = await getDocs(qEvents);
    
    const events = eventSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as any[];

    // 2. Fetch Sponsors
    const sponsorsRef = collection(db, "sponsors");
    const sponsorSnap = await getDocs(sponsorsRef);
    const sponsors = sponsorSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as any[];

    return (
        <div className="bg-brand-dark-olive min-h-screen text-white selection:bg-cyan-500/30 selection:text-cyan-200 ">
            <CustomCursor />
            <CursorHighlight />
            <Navbar />
                <HeroSection />
                {/* <SectionPortal> */}
					<TechShowcaseSection />
				{/* </SectionPortal> */}

            <EventsSection initialEvents={events} />
            <SponsorsSection initialSponsors={sponsors} />
            
            <Footer />
        </div>
    );
}