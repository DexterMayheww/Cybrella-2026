// src/lib/firebase-admin.ts
import * as admin from "firebase-admin";

// console.log("--- FIREBASE_ADMIN_MODULE_LOADED ---");

if (!admin.apps.length) {
    // console.log("--- INITIALIZING_ADMIN_SDK ---");
    
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    // Log the actual values (carefully) to the TERMINAL
    // console.log("CONFIG_CHECK:", {
    //     projectId,
    //     email: clientEmail,
    //     keyExists: !!privateKey,
    //     keyLength: privateKey?.length
    // });

    try {
        const formattedKey = privateKey?.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: formattedKey,
            }),
        });
        // console.log("✅ ADMIN_SDK_SUCCESS");
    } catch (error: any) {
        console.error("❌ ADMIN_INIT_FAILED:", error.message);
    }
}

export const adminDb = admin.firestore();