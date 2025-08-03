import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/permissions';
import { hasPermission } from '@/lib/permissions';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  contentAttachment: f({
    image: { maxFileSize: '4MB', maxFileCount: 10 },
    pdf: { maxFileSize: '10MB', maxFileCount: 5 },
    text: { maxFileSize: '2MB', maxFileCount: 10 },
    video: { maxFileSize: '50MB', maxFileCount: 3 },
    audio: { maxFileSize: '20MB', maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Check permissions
      if (
        !hasPermission(session.user.role as any, PERMISSIONS.CONTENT_CREATE)
      ) {
        throw new Error('Insufficient permissions');
      }

      // Return user info for use in onUploadComplete
      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      console.log('Upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);

      // Here you could save the file info to your database
      // For now, we'll just return the file info
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Hero image upload route - optimized for content hero images
  heroImage: f({
    image: {
      maxFileSize: '5MB',
      maxFileCount: 1,
      // Optimize for common hero image formats
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    },
  })
    .middleware(async ({ req }) => {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Check permissions - allow content creation and editing
      if (
        !hasPermission(session.user.role as any, PERMISSIONS.CONTENT_CREATE) &&
        !hasPermission(session.user.role as any, PERMISSIONS.CONTENT_EDIT)
      ) {
        throw new Error('Insufficient permissions');
      }

      // Return user info for use in onUploadComplete
      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code runs on your server after upload
      console.log('Hero image upload complete for userId:', metadata.userId);
      console.log('Hero image URL:', file.url);

      // Return the file info for the hero image
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        fileName: file.name,
        fileSize: file.size,
      };
    }),

  // Add more file routes as needed
  profileImage: f({
    image: { maxFileSize: '2MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        throw new Error('Unauthorized');
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Profile image uploaded for userId:', metadata.userId);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
