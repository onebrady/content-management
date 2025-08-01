import { prisma } from '@/lib/prisma';
import { Content, ContentVersion } from '@/types/database';

/**
 * Create a new version of a content item
 *
 * @param contentId The ID of the content to version
 * @param userId The ID of the user creating the version
 * @param changeDescription Optional description of changes made
 * @returns The newly created content version
 */
export async function createContentVersion(
  contentId: string,
  userId: string,
  changeDescription?: string
): Promise<ContentVersion> {
  // Get the current content
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!content) {
    throw new Error(`Content with ID ${contentId} not found`);
  }

  // Calculate the next version number
  const nextVersionNumber = content.version + 1;

  // Create a new version record
  const newVersion = await prisma.contentVersion.create({
    data: {
      versionNumber: content.version, // Store the current version
      title: content.title,
      body: content.body,
      status: content.status,
      type: content.type,
      priority: content.priority,
      dueDate: content.dueDate,
      changeDescription,
      contentId: content.id,
      createdById: userId,
    },
    include: {
      content: true,
      createdBy: true,
    },
  });

  // Update the content's version number
  await prisma.content.update({
    where: { id: contentId },
    data: { version: nextVersionNumber },
  });

  // Create activity record
  await prisma.contentActivity.create({
    data: {
      contentId,
      userId,
      action: 'VERSION_CREATED',
      details: `Version ${content.version} created${
        changeDescription ? `: ${changeDescription}` : ''
      }`,
    },
  });

  return newVersion;
}

/**
 * Get all versions of a content item
 *
 * @param contentId The ID of the content
 * @returns Array of content versions
 */
export async function getContentVersions(
  contentId: string
): Promise<ContentVersion[]> {
  const versions = await prisma.contentVersion.findMany({
    where: { contentId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      versionNumber: 'desc',
    },
  });

  return versions;
}

/**
 * Get a specific version of a content item
 *
 * @param contentId The ID of the content
 * @param versionNumber The version number to retrieve
 * @returns The requested content version
 */
export async function getContentVersion(
  contentId: string,
  versionNumber: number
): Promise<ContentVersion | null> {
  const version = await prisma.contentVersion.findFirst({
    where: {
      contentId,
      versionNumber,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return version;
}

/**
 * Restore a content item to a previous version
 *
 * @param contentId The ID of the content
 * @param versionNumber The version number to restore to
 * @param userId The ID of the user performing the restoration
 * @returns The updated content
 */
export async function restoreContentVersion(
  contentId: string,
  versionNumber: number,
  userId: string
): Promise<Content> {
  // Get the version to restore
  const versionToRestore = await prisma.contentVersion.findFirst({
    where: {
      contentId,
      versionNumber,
    },
  });

  if (!versionToRestore) {
    throw new Error(
      `Version ${versionNumber} of content ${contentId} not found`
    );
  }

  // Get the current content
  const currentContent = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!currentContent) {
    throw new Error(`Content with ID ${contentId} not found`);
  }

  // Create a version of the current state before restoring
  await createContentVersion(
    contentId,
    userId,
    `Automatic version created before restoring to version ${versionNumber}`
  );

  // Restore the content to the selected version
  const updatedContent = await prisma.content.update({
    where: { id: contentId },
    data: {
      title: versionToRestore.title,
      body: versionToRestore.body,
      priority: versionToRestore.priority,
      dueDate: versionToRestore.dueDate,
      // Note: We don't restore status as that would break workflow
      // We also don't restore type as that's a fundamental property
    },
    include: {
      author: true,
      assignee: true,
      tags: true,
    },
  });

  // Create activity record
  await prisma.contentActivity.create({
    data: {
      contentId,
      userId,
      action: 'VERSION_RESTORED',
      details: `Content restored to version ${versionNumber}`,
    },
  });

  return updatedContent;
}

/**
 * Compare two versions of content and return the differences
 *
 * @param contentId The ID of the content
 * @param version1 First version number to compare
 * @param version2 Second version number to compare
 * @returns Object containing the differences between versions
 */
export async function compareContentVersions(
  contentId: string,
  version1: number,
  version2: number
): Promise<{
  titleChanged: boolean;
  bodyChanged: boolean;
  statusChanged: boolean;
  priorityChanged: boolean;
  dueDateChanged: boolean;
  version1: ContentVersion | null;
  version2: ContentVersion | null;
}> {
  // Get both versions
  const [v1, v2] = await Promise.all([
    getContentVersion(contentId, version1),
    getContentVersion(contentId, version2),
  ]);

  if (!v1 || !v2) {
    throw new Error('One or both versions not found');
  }

  // Compare the versions
  return {
    titleChanged: v1.title !== v2.title,
    bodyChanged: JSON.stringify(v1.body) !== JSON.stringify(v2.body),
    statusChanged: v1.status !== v2.status,
    priorityChanged: v1.priority !== v2.priority,
    dueDateChanged:
      (v1.dueDate?.toISOString() || null) !==
      (v2.dueDate?.toISOString() || null),
    version1: v1,
    version2: v2,
  };
}
