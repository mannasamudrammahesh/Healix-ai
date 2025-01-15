import { createUploadthing } from "uploadthing/next";
import { getToken } from "next-auth/jwt";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Simple auth check
      const user = { id: "guest" }; // You can implement proper auth here

      if (!user) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File:", file);

      return { uploadedBy: metadata.userId };
    }),
} as const;

export type OurFileRouter = typeof ourFileRouter;
