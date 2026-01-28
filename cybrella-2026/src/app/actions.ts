// src/app/actions.ts
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, query, orderBy, setDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { 
    appendRegistrationToSheets, 
    updateRegistrationInSheets, 
    deleteRegistrationFromSheets, 
    rebuildSpreadsheet
} from "@/lib/sheets";
import { adminDb } from "@/lib/firebase-admin";

// --- EXISTING CATEGORY/EVENT ACTIONS ---
export async function addCategory(name: string) {
    try {
        if (!name) throw new Error("Name is required");
        const res = await addDoc(collection(db, "categories"), { 
            name: name.toUpperCase(),
            createdAt: new Date().toISOString() 
        });
        return { success: true, id: res.id };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        await deleteDoc(doc(db, "categories", id));
        revalidatePath("/admin");
    } catch (e) { console.error(e); }
}

// --- NEW REGISTRATION ACTIONS (FIREBASE + SHEETS) ---

export async function syncNewRegistration(data: any) {
    try {
        if (!data.eventTitle || data.eventTitle === "UNKNOWN_EVENT") {
            throw new Error("EVENT_TITLE_REQUIRED");
        }

        // 1. Sanitize the title for collection naming
        const sanitizedTitle = data.eventTitle.replace(/[^a-zA-Z0-9]/g, '_');
        const collectionName = `${sanitizedTitle}_registrations`;
        
        // 2. Standardize data for BOTH collections
        // We use toISOString for consistency with the Admin Table and Google Sheets
        const finalData = { 
            ...data, 
            status: data.status || "PENDING_VERIFICATION",
            enlistedAt: new Date().toISOString() 
        };

        // 3. Generate ONE ID to be used across all platforms (Master, Sector, Sheets)
        const masterRef = doc(collection(db, "master_registrations"));
        const newId = masterRef.id;
        const sectorRef = doc(db, collectionName, newId);

        // 4. Atomic-like Write: Using setDoc with the same ID ensures no duplicates
        // Even if the action retries, it will only overwrite, not create a new one.
        await Promise.all([
            setDoc(masterRef, { ...finalData, id: newId }),
            setDoc(sectorRef, { ...finalData, id: newId })
        ]);

        // 5. Sync to Sheets
        await appendRegistrationToSheets({ ...finalData, id: newId });
        
        return { success: true, id: newId };
    } catch (e: any) {
        console.error("CRITICAL_SYNC_ERROR:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteRegistrationAction(id: string, eventTitle: string) {
    try {
        if (!id || !eventTitle) throw new Error("MISSING_IDENTIFIER_OR_SECTOR");

        const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, '_');
        const sectorCollectionName = `${sanitizedTitle}_registrations`;

        // Using Admin SDK (adminDb) to bypass security rules
        const batch = adminDb.batch();
        
        const masterRef = adminDb.collection("master_registrations").doc(id);
        const sectorRef = adminDb.collection(sectorCollectionName).doc(id);

        batch.delete(masterRef);
        batch.delete(sectorRef);

        await batch.commit();

        // 2. Delete Sheets Row
        await deleteRegistrationFromSheets(id, eventTitle);

        return { success: true };
    } catch (e: any) {
        console.error("DELETION_FAILURE:", e);
        return { success: false, error: e.message };
    }
}

export async function updateRegistrationStatusAction(id: string, status: string, eventTitle: string) {
    try {
        // Using Admin SDK to update
        await adminDb.collection("master_registrations").doc(id).update({ status });
        
        // Update Google Sheets
        await updateRegistrationInSheets(id, status, eventTitle);
        
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function forceSyncAllToSheets() {
    try {
        // 1. Fetch all registrations from Firestore
        const q = query(collection(db, "master_registrations"), orderBy("enlistedAt", "asc"));
        const snapshot = await getDocs(q);
        const allData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (allData.length === 0) return { success: false, error: "NO_DATA_FOUND" };

        // 2. Rebuild the Google Sheet
        await rebuildSpreadsheet(allData as any);

        return { success: true, count: allData.length };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message };
    }
}