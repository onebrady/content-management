import { Code, Group, ScrollArea } from '@mantine/core';
import { LinksGroup } from './NavbarLinksGroup/NavbarLinksGroup';
import { UserButton } from './UserButton/UserButton';
import { Logo } from './Logo';
import { BottomNavIcons } from './BottomNavIcons';
import { useNavigation } from '@/hooks/useNavigation';
import { getAppVersion, formatVersion } from '@/lib/version';
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
            <Code fw={700}>{formatVersion(getAppVersion())}</Code>
          </Group>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <BottomNavIcons />
        <UserButton />
      </div>
    </nav>
  );
}
