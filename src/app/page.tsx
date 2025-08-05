'use client';

import {
  Button,
  Container,
  Stack,
  Text,
  Title,
  Paper,
  Group,
} from '@mantine/core';
import { useMantineTheme } from '@mantine/core';
import { getCustomColors } from '@/lib/theme-utils';

export default function HomePage() {
  const theme = useMantineTheme();
  const customColors = getCustomColors(theme);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1} ta="center">
          Content Management Tool
        </Title>

        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Title order={2}>Theme Test</Title>
            <Text>
              This page demonstrates that the Mantine theme is working
              correctly.
            </Text>

            <Group>
              <Button color="terracotta">Primary Button</Button>
              <Button variant="outline" color="terracotta">
                Outline Button
              </Button>
              <Button variant="light" color="terracotta">
                Light Button
              </Button>
            </Group>

            <Paper p="md" style={{ backgroundColor: customColors.background }}>
              <Text size="sm" c="dimmed">
                Custom background color: {customColors.background}
              </Text>
            </Paper>

            <Paper p="md" style={{ backgroundColor: customColors.sidebar }}>
              <Text size="sm" c="dimmed">
                Sidebar color: {customColors.sidebar}
              </Text>
            </Paper>

            <Text>
              Primary color: {theme.colors.terracotta?.[6] || 'Not set'}
            </Text>

            <Text>Theme primary color: {theme.primaryColor}</Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
