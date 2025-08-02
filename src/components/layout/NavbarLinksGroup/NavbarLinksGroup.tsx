'use client';

import { useState } from 'react';
import { UnstyledButton, Group, Text, rem, Collapse, Box } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import classes from './NavbarLinksGroup.module.css';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  link,
}: LinksGroupProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component="a"
      className={classes.link}
      href={link.link}
      key={link.label}
      onClick={(event) => {
        event.preventDefault();
        router.push(link.link);
      }}
      data-active={pathname === link.link || undefined}
    >
      {link.label}
    </Text>
  ));

  const handleClick = () => {
    if (hasLinks) {
      setOpened((o) => !o);
    } else if (link) {
      router.push(link);
    }
  };

  const isActive = link
    ? pathname === link
    : pathname.startsWith('/' + label.toLowerCase().replace(' ', ''));

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
        className={classes.control}
        data-active={isActive || undefined}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ flex: 1 }}>
            <Group>
              <Icon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
              <span>{label}</span>
            </Group>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: opened ? 'rotate(-90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
