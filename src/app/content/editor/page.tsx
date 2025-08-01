'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { Save, Preview } from '@mui/icons-material';
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
      console.log('Auto-saved content:', savedContent);
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

  const handleSave = () => {
    setSavedContent(content);
    console.log('Manually saved content:', content);
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const sampleContent = `
    <h1>Welcome to the Rich Text Editor</h1>
    <p>This is a <strong>powerful</strong> rich text editor built with <em>Tiptap</em> and Material-UI.</p>
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
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Rich Text Editor Test
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={isDirty ? 'Unsaved changes' : 'All changes saved'}
              color={isDirty ? 'warning' : 'success'}
              size="small"
            />
          </Box>
        </Box>

        <PermissionGuard permission={PERMISSIONS.CONTENT_CREATE}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Editor</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Preview />}
                        onClick={handlePreview}
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={!isDirty}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>

                  <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your content..."
                    onSave={handleSave}
                    onPreview={handlePreview}
                  />
                </CardContent>
              </Card>
            </Grid>

            {showPreview && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Preview
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Content
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setContent(sampleContent)}
                    sx={{ mb: 2 }}
                  >
                    Load Sample Content
                  </Button>
                  <Alert severity="info">
                    Click the button above to load sample content and test the
                    editor features.
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Editor Information
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Chip
                      label={`Content length: ${content.length} characters`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Word count: ${content.split(/\s+/).filter((word) => word.length > 0).length} words`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Last saved: ${savedContent ? new Date().toLocaleTimeString() : 'Never'}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Raw HTML Output
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      maxHeight: 200,
                    }}
                  >
                    {content || '<p>No content yet...</p>'}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </PermissionGuard>
      </Box>
    </DashboardLayout>
  );
}
