import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
 
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});

// utils/uploadthing.ts
import { generateComponents } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
 
export const { UploadButton, UploadDropzone, Uploader } = generateComponents<OurFileRouter>();
