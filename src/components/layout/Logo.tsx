import { Text } from '@mantine/core';

interface LogoProps {
  style?: React.CSSProperties;
}

export function Logo({ style }: LogoProps) {
  return (
    <Text
      size="lg"
      fw={700}
      style={{
        ...style,
        color: 'var(--mantine-color-primary-6)',
      }}
    >
      ContentFlow
    </Text>
  );
}
