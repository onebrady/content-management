'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit,
  ArrowBack,
  CalendarToday,
  Person,
  Assignment,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { ContentDetail } from '@/components/content/ContentDetail';
import { useAuth } from '@/hooks/useAuth';

interface Content {
  id: string;
  title: string;
  slug: string;
  body: any;
  status: string;
  type: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tags: Array<{ id: string; name: string }>;
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
  }>;
  comments: Array<any>;
  approvals: Array<any>;
  _count: {
    comments: number;
    approvals: number;
    attachments: number;
  };
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/slug/${slug}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Content not found');
          } else {
            setError('Failed to load content');
          }
          return;
        }

        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    }
  }, [slug]);

  const handleEdit = () => {
    if (content) {
      router.push(`/content/edit/${content.id}`);
    }
  };

  const handleBack = () => {
    router.push('/content');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Back to Content
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  if (!content) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Content not found
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Back to Content
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const canEdit = user?.role === 'ADMIN' || content.author.id === user?.id;

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Breadcrumbs
              items={[
                { label: 'Content', href: '/content' },
                { label: content.title, href: `/content/${content.slug}` },
              ]}
            />
            <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 1 }}>
              {content.title}
            </Typography>
            
            {/* Meta information */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={content.status}
                color={
                  content.status === 'PUBLISHED'
                    ? 'success'
                    : content.status === 'DRAFT'
                    ? 'default'
                    : 'warning'
                }
                size="small"
              />
              <Chip
                label={content.type}
                variant="outlined"
                size="small"
              />
              <Chip
                label={content.priority}
                color={
                  content.priority === 'HIGH'
                    ? 'error'
                    : content.priority === 'MEDIUM'
                    ? 'warning'
                    : 'default'
                }
                size="small"
              />
            </Box>

            {/* Additional meta info */}
            <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" />
                <Typography variant="body2">
                  {content.author.name}
                </Typography>
              </Box>
              {content.assignee && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Assignment fontSize="small" />
                  <Typography variant="body2">
                    {content.assignee.name}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  {new Date(content.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {canEdit && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{
                background: 'linear-gradient(45deg, #74b9ff 30%, #0984e3 90%)',
                boxShadow: '0 3px 5px 2px rgba(116, 185, 255, .3)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, #0984e3 30%, #74b9ff 90%)',
                  boxShadow: '0 4px 8px 2px rgba(116, 185, 255, .4)',
                },
              }}
            >
              Edit
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        <ContentDetail content={content} />
      </Box>
    </DashboardLayout>
  );
} 