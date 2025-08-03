import { Code, Group, ScrollArea } from '@mantine/core';
import { LinksGroup } from './NavbarLinksGroup/NavbarLinksGroup';
import { UserButton } from './UserButton/UserButton';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useNavigation } from '@/hooks/useNavigation';
import classes from './NavbarNested.module.css';

export function NavbarNested() {
  const { navigation } = useNavigation();

  const links = navigation.map((item) => (
    <LinksGroup {...item} key={item.label} />
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: 120 }} />
          <Group gap="xs">
            <Code fw={700}>v1.0.0</Code>
          </Group>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <ThemeToggle />
        <UserButton />
      </div>
    </nav>
  );
}
