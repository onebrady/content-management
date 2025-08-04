'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Text,
  Card,
  Button,
  Alert,
  Grid,
  Badge,
  Group,
  Title,
  Stack,
} from '@mantine/core';
import { IconDeviceFloppy, IconEye } from '@tabler/icons-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { useAuth } from '@/hooks/useAuth';
import { useAutoSave } from '@/hooks/useAutoSave';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function EditorTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { isDirty } = useAutoSave({
    content,
    onSave: (savedContent) => {
      setSavedContent(savedContent);
    },
    enabled: true,
    delay: 2000, // 2 seconds
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAutoSave = useCallback((content: string) => {
    if (content.trim()) {
      localStorage.setItem('editor-content', content);
    }
  }, []);

  const handleManualSave = useCallback((content: string) => {
    if (content.trim()) {
      localStorage.setItem('editor-content', content);
    }
  }, []);

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const sampleContent = `
    <h1>Welcome to the Rich Text Editor</h1>
    <p>This is a <strong>powerful</strong> rich text editor built with <em>Tiptap</em> and Mantine.</p>
    <h2>Features</h2>
    <ul>
      <li>Text formatting (bold, italic, underline, strikethrough)</li>
      <li>Headings (H1, H2, H3)</li>
      <li>Lists (bullet and numbered)</li>
      <li>Blockquotes and code blocks</li>
      <li>Links and images</li>
      <li>Auto-save functionality</li>
    </ul>
    <blockquote>
      <p>This is a blockquote example.</p>
    </blockquote>
    <p>You can also add <code>inline code</code> and code blocks:</p>
    <pre><code>console.log('Hello, World!');</code></pre>
  `;

  return (
    <DashboardLayout>
      <Box p="md">
        <Breadcrumbs />

        <Group justify="space-between" align="center" mb="lg">
          <Title order={1}>Rich Text Editor Test</Title>
          <Badge color={isDirty ? 'yellow' : 'green'} size="sm">
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </Badge>
        </Group>

        <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Card>
                <Box p="md">
                  <Group justify="space-between" align="center" mb="md">
                    <Title order={3}>Editor</Title>
                    <Group gap="xs">
                      <Button
                        variant="outline"
                        size="sm"
                        leftSection={<IconEye size={16} />}
                        onClick={handlePreview}
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </Button>
                      <Button
                        variant="filled"
                        size="sm"
                        leftSection={<IconDeviceFloppy size={16} />}
                        onClick={handleSave}
                        disabled={!isDirty}
                      >
                        Save
                      </Button>
                    </Group>
                  </Group>

                  <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your content..."
                  />
                </Box>
              </Card>
            </Grid.Col>

            {showPreview && (
              <Grid.Col span={12}>
                <Card>
                  <Box p="md">
                    <Title order={3} mb="md">
                      Preview
                    </Title>
                    <Box
                      p="md"
                      style={{
                        border: '1px solid var(--mantine-color-gray-3)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        backgroundColor: 'var(--mantine-color-gray-0)',
                      }}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </Box>
                </Card>
              </Grid.Col>
            )}

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card>
                <Box p="md">
                  <Title order={3} mb="md">
                    Sample Content
                  </Title>
                  <Button
                    variant="outline"
                    onClick={() => setContent(sampleContent)}
                    mb="md"
                  >
                    Load Sample Content
                  </Button>
                  <Alert color="blue">
                    Click the button above to load sample content and test the
                    editor features.
                  </Alert>
                </Box>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card>
                <Box p="md">
                  <Title order={3} mb="md">
                    Editor Information
                  </Title>
                  <Stack gap="xs">
                    <Badge variant="outline" size="sm">
                      Content length: {content.length} characters
                    </Badge>
                    <Badge variant="outline" size="sm">
                      Word count:{' '}
                      {
                        content.split(/\s+/).filter((word) => word.length > 0)
                          .length
                      }{' '}
                      words
                    </Badge>
                    <Badge variant="outline" size="sm">
                      Last saved:{' '}
                      {savedContent ? new Date().toLocaleTimeString() : 'Never'}
                    </Badge>
                  </Stack>
                </Box>
              </Card>
            </Grid.Col>

            <Grid.Col span={12}>
              <Card>
                <Box p="md">
                  <Title order={3} mb="md">
                    Raw HTML Output
                  </Title>
                  <Box
                    component="pre"
                    p="md"
                    style={{
                      backgroundColor: 'var(--mantine-color-gray-1)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      maxHeight: 200,
                    }}
                  >
                    {content || '<p>No content yet...</p>'}
                  </Box>
                </Box>
              </Card>
            </Grid.Col>
          </Grid>
        </PermissionGuard>
      </Box>
    </DashboardLayout>
  );
}
