import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

if (admin.apps.length === 0) {

  const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  console.log("Firebase initialized with project:", serviceAccount.project_id);
}

export default admin;