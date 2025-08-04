'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Paper,
  Grid,
  Divider,
  Badge,
  Loader,
  Alert,
  Button,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import { IconArrowsCompare, IconArrowLeft } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { diff as DiffEditor } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

interface VersionCompareProps {
  contentId: string;
  version1: number;
  version2: number;
  onBack: () => void;
}

interface VersionData {
  id: string;
  versionNumber: number;
  title: string;
  body: any;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  changeDescription: string | null;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ComparisonResult {
  titleChanged: boolean;
  bodyChanged: boolean;
  statusChanged: boolean;
  priorityChanged: boolean;
  dueDateChanged: boolean;
  version1: VersionData | null;
  version2: VersionData | null;
}

export function VersionCompare({
  contentId,
  version1,
  version2,
  onBack,
}: VersionCompareProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comparison data
  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/content/${contentId}/versions/compare?v1=${version1}&v2=${version2}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch version comparison');
        }

        const data = await response.json();
        setComparison(data);
      } catch (err) {
        console.error('Error fetching version comparison:', err);
        setError('Failed to load version comparison. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId && version1 && version2) {
      fetchComparison();
    }
  }, [contentId, version1, version2]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format JSON for diff editor
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return '{}';
    }
  };

  if (loading) {
    return (
      <Box
        style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
      >
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert color="red" mb="md">
          {error}
        </Alert>
        <Button leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Back to Version History
        </Button>
      </Box>
    );
  }

  if (!comparison || !comparison.version1 || !comparison.version2) {
    return (
      <Box>
        <Alert color="red" mb="md">
          Could not load comparison data
        </Alert>
        <Button leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Back to Version History
        </Button>
      </Box>
    );
  }

  const { version1: v1, version2: v2 } = comparison;

  return (
    <Box>
      <Group justify="space-between" align="center" mb="lg">
        <Group gap="xs">
          <IconArrowsCompare size={20} />
          <Title order={4}>Comparing Versions</Title>
        </Group>
        <Button leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Back to Version History
        </Button>
      </Group>

      <Grid gutter="md" mb="lg">
        <Grid.Col span={6}>
          <Paper p="md" h="100%">
            <Group gap="xs" mb="xs">
              <Text fw={500}>Version {v1.versionNumber}</Text>
              <Badge size="sm" variant="filled">
                v{v1.versionNumber}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Created by {v1.createdBy.name} {formatDate(v1.createdAt)}
            </Text>
            {v1.changeDescription && (
              <Text size="sm" mt="xs">
                {v1.changeDescription}
              </Text>
            )}
          </Paper>
        </Grid.Col>
        <Grid.Col span={6}>
          <Paper p="md" h="100%">
            <Group gap="xs" mb="xs">
              <Text fw={500}>Version {v2.versionNumber}</Text>
              <Badge size="sm" variant="filled">
                v{v2.versionNumber}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Created by {v2.createdBy.name} {formatDate(v2.createdAt)}
            </Text>
            {v2.changeDescription && (
              <Text size="sm" mt="xs">
                {v2.changeDescription}
              </Text>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      <Title order={4} mb="md">
        Changes
      </Title>

      <Paper p="lg" mb="lg">
        <Stack gap="lg">
          {/* Title comparison */}
          <Box>
            <Group gap="xs" mb="xs">
              <Text fw={500}>Title</Text>
              {comparison.titleChanged && (
                <Badge size="sm" color="yellow">
                  Changed
                </Badge>
              )}
            </Group>
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.titleChanged
                      ? 'var(--mantine-color-red-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Text>{v1.title}</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.titleChanged
                      ? 'var(--mantine-color-green-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Text>{v2.title}</Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>

          {/* Status comparison */}
          <Box>
            <Group gap="xs" mb="xs">
              <Text fw={500}>Status</Text>
              {comparison.statusChanged && (
                <Badge size="sm" color="yellow">
                  Changed
                </Badge>
              )}
            </Group>
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.statusChanged
                      ? 'var(--mantine-color-red-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Badge>{v1.status}</Badge>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.statusChanged
                      ? 'var(--mantine-color-green-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Badge>{v2.status}</Badge>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>

          {/* Priority comparison */}
          <Box>
            <Group gap="xs" mb="xs">
              <Text fw={500}>Priority</Text>
              {comparison.priorityChanged && (
                <Badge size="sm" color="yellow">
                  Changed
                </Badge>
              )}
            </Group>
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.priorityChanged
                      ? 'var(--mantine-color-red-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Badge>{v1.priority}</Badge>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.priorityChanged
                      ? 'var(--mantine-color-green-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Badge>{v2.priority}</Badge>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>

          {/* Due date comparison */}
          <Box>
            <Group gap="xs" mb="xs">
              <Text fw={500}>Due Date</Text>
              {comparison.dueDateChanged && (
                <Badge size="sm" color="yellow">
                  Changed
                </Badge>
              )}
            </Group>
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.dueDateChanged
                      ? 'var(--mantine-color-red-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Text>
                    {v1.dueDate
                      ? new Date(v1.dueDate).toLocaleDateString()
                      : 'Not set'}
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={6}>
                <Paper
                  variant="outline"
                  p="md"
                  style={{
                    backgroundColor: comparison.dueDateChanged
                      ? 'var(--mantine-color-green-0)'
                      : 'var(--mantine-color-gray-0)',
                  }}
                >
                  <Text>
                    {v2.dueDate
                      ? new Date(v2.dueDate).toLocaleDateString()
                      : 'Not set'}
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        </Stack>
      </Paper>

      {/* Content body comparison */}
      <Group gap="xs" mb="md">
        <Title order={4}>Content Body</Title>
        {comparison.bodyChanged && (
          <Badge size="sm" color="yellow">
            Changed
          </Badge>
        )}
      </Group>

      <Paper p={0} mb="lg" style={{ overflow: 'hidden' }}>
        <DiffEditor
          mode="json"
          theme="github"
          value={[formatJson(v1.body), formatJson(v2.body)]}
          readOnly={true}
          width="100%"
          height="400px"
          setOptions={{
            showLineNumbers: true,
            showPrintMargin: false,
          }}
          editorProps={{ $blockScrolling: true }}
        />
      </Paper>
    </Box>
  );
}
