'use client';

import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Title,
  TextFields,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Image,
  Link,
} from '@mui/icons-material';

interface SlashCommandsProps {
  items: any[];
  command: (item: any) => void;
}

const SlashCommandsComponent = ({ items, command }: SlashCommandsProps) => {
  return (
    <Paper
      elevation={8}
      sx={{ maxWidth: 300, maxHeight: 300, overflow: 'auto' }}
    >
      <List dense>
        {items.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={() => command(item)}>
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </ListItem>
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
        icon: <Title fontSize="small" />,
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
        icon: <TextFields fontSize="small" />,
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
        icon: <TextFields fontSize="small" />,
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
        icon: <FormatListBulleted fontSize="small" />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
      },
      {
        title: 'Numbered List',
        description: 'Create a numbered list',
        icon: <FormatListNumbered fontSize="small" />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
      },
      {
        title: 'Blockquote',
        description: 'Create a blockquote',
        icon: <FormatQuote fontSize="small" />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
      },
      {
        title: 'Code Block',
        description: 'Create a code block',
        icon: <Code fontSize="small" />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
      },
      {
        title: 'Image',
        description: 'Insert an image',
        icon: <Image fontSize="small" />,
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
        icon: <Link fontSize="small" />,
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
        component = new ReactRenderer(SlashCommands, {
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
