'use client';

import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { Box, Paper, List, Text, Group, Stack } from '@mantine/core';
import {
  IconHeading,
  IconText,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconPhoto,
  IconLink,
} from '@tabler/icons-react';

interface SlashCommandsProps {
  items: any[];
  command: (item: any) => void;
}

const SlashCommandsComponent = ({ items, command }: SlashCommandsProps) => {
  return (
    <Paper
      shadow="md"
      style={{ maxWidth: 300, maxHeight: 300, overflow: 'auto' }}
    >
      <List>
        {items.map((item, index) => (
          <List.Item key={index}>
            <Box
              onClick={() => command(item)}
              style={{ cursor: 'pointer', padding: '8px 12px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--mantine-color-muted-1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Group gap="sm">
                <Box style={{ minWidth: 24 }}>{item.icon}</Box>
                <Stack gap={2}>
                  <Text size="sm" fw={500}>
                    {item.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.description}
                  </Text>
                </Stack>
              </Group>
            </Box>
          </List.Item>
        ))}
      </List>
    </Paper>
  );
};

export const SlashCommands = {
  items: ({ query }: { query: string }) => {
    const items = [
      {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: <IconHeading size={16} />,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 1 })
            .run();
        },
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: <IconText size={16} />,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 2 })
            .run();
        },
      },
      {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: <IconText size={16} />,
        command: ({ editor, range }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 3 })
            .run();
        },
      },
      {
        title: 'Bullet List',
        description: 'Create a bullet list',
        icon: <IconList size={16} />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: 'Numbered List',
        description: 'Create a numbered list',
        icon: <IconListNumbers size={16} />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: 'Blockquote',
        description: 'Create a blockquote',
        icon: <IconQuote size={16} />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
      },
      {
        title: 'Code Block',
        description: 'Create a code block',
        icon: <IconCode size={16} />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
      },
      {
        title: 'Image',
        description: 'Insert an image',
        icon: <IconPhoto size={16} />,
        command: ({ editor, range }: any) => {
          const url = window.prompt('Enter the image URL');
          if (url) {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setImage({ src: url })
              .run();
          }
        },
      },
      {
        title: 'Link',
        description: 'Insert a link',
        icon: <IconLink size={16} />,
        command: ({ editor, range }: any) => {
          const url = window.prompt('Enter the URL');
          if (url) {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .setLink({ href: url })
              .run();
          }
        },
      },
    ];

    return items.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SlashCommandsComponent, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate: (props: any) => {
        component.updateProps(props);

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.onKeyDown(props);
      },

      onExit: () => {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
