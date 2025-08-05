'use client';

import { useState, useEffect } from 'react';
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

  // Check if any child link is currently active (exact match)
  const hasActiveChild =
    hasLinks && links.some((link) => pathname === link.link);

  // Check if this is a direct link and is active (exact match)
  const isDirectLinkActive = link ? pathname === link : false;

  // Check if this is a parent with active child or direct link active
  const isActive = isDirectLinkActive || hasActiveChild;

  // Auto-open/close based on active state
  useEffect(() => {
    if (hasLinks) {
      if (hasActiveChild) {
        setOpened(true);
      } else {
        setOpened(false);
      }
    }
  }, [hasLinks, hasActiveChild, pathname]);

  const items = (hasLinks ? links : []).map((link) => {
    const isChildActive = pathname === link.link;

    return (
      <Text
        component="a"
        className={classes.link}
        href={link.link}
        key={link.label}
        onClick={(event) => {
          event.preventDefault();
          router.push(link.link);
        }}
        data-active={isChildActive || undefined}
      >
        {link.label}
      </Text>
    );
  });

  const handleClick = () => {
    if (hasLinks) {
      setOpened((o) => !o);
    } else if (link) {
      router.push(link);
    }
  };

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
