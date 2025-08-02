<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# oh, I like https://ui.mantine.dev

That's beautiful.   Can you build a complete .md file with all the details about installing and all of the components available and whatever other documentation needed

```markdown
# Mantine UI: Complete Guide & Component Overview

Mantine UI is a **modern, responsive React component library** designed for fast development and beautiful results, with rich theming and flexibility out of the box. This markdown guide covers installation, setup, available components, and tips for using Mantine UI in your Next.js or React projects.

---

## 🌟 Key Features

- **123+ responsive components** built on Mantine theme[^1][^7]
- **Light and dark modes** by default, easily configurable
- **Full customization:** colors, fonts, shadows, spacing, more
- **MIT license:** free for commercial use
- **Premade UI patterns:** navbars, dashboards, cards, forms, and more

---

## 🚀 Installation & Setup

### 1. Install Mantine Packages

Use npm or yarn for React or Next.js apps:

```

npm install @mantine/core @mantine/hooks

```
or
```

yarn add @mantine/core @mantine/hooks

```
> _You may add other Mantine packages as needed (e.g. @mantine/notifications, @mantine/dates)._[^4][^2][^9]

### 2. Add Global Styles (if needed)

In your main app file:

```

import '@mantine/core/styles.css';

```
_This applies default Mantine styles and resets._

### 3. Wrap Your App with MantineProvider

In **Next.js**, edit `pages/_app.js` or `pages/_app.tsx`:

```

import { MantineProvider } from '@mantine/core';

function MyApp({ Component, pageProps }) {
return (
<MantineProvider withGlobalStyles withNormalizeCSS>
<Component {...pageProps} />
</MantineProvider>
);
}

export default MyApp;

```
[^4][^6]

---

## 📦 Available Mantine UI Components

Below is a categorized overview of the 123+ Mantine UI components and UI patterns[^1][^7][^19]. For full core documentation (props, API), refer to `mantine.dev/core/[component]/`.

### Application UI (82 components)
| Category              | Components                                 |
|-----------------------|--------------------------------------------|
| Navbars               | 9 variants                                 |
| Headers               | 6 variants                                 |
| Footers               | 4 variants                                 |
| Grids                 | 3                                           |
| User Info/Controls    | 8                                           |
| Inputs                | 14                                          |
| Buttons               | 6                                           |
| Sliders               | 6                                           |
| Dropzones             | 1                                           |
| Application Cards     | 7                                           |
| Stats                 | 9                                           |
| Tables                | 4                                           |
| Drag'n'Drop           | 3                                           |
| Carousels             | 2                                           |

### Page Sections (30 components)
| Category                  | Components             |
|---------------------------|------------------------|
| Hero Headers              | 6                      |
| Features                  | 5                      |
| Authentication            | 4                      |
| FAQ                       | 4                      |
| Contact                   | 3                      |
| Error Pages               | 5                      |
| Banners                   | 3                      |

### Blog UI (11 components)
| Category          | Components                |
|-------------------|--------------------------|
| Article Cards     | 7                        |
| Table of Contents | 2                        |
| Comments          | 2                        |

### More Core Components[^10][^17][^19]:
- **Accordion, Affix, Alert, Avatar, Badge, Blockquote, Breadcrumbs, Burger, Calendar, Card, Checkbox, Chip, Code, Combobox, Dialog, Divider, Drawer, Group, Input, Kbd, List, LoadingOverlay, Loader, Mark, Menu, Modal, Pagination, Paper, Popover, Progress, Rating, RingProgress, ScrollArea, SegmentedControl, Skeleton, Slider, Stack, Stepper, Switch, Table, Tabs, Text, ThemeIcon, Timeline, Title, Tooltip, Tree, UnstyledButton, Typography, VisuallyHidden, etc.**

For a **full CSS file/component import list**, see Mantine's [css-files-list page][^10].

---

## 🧰 Additional Utilities & Hooks

- 50+ hooks for color scheme, accessibility, drag and drop, etc.[^19]
- Utility components for layout (`Container`, `Grid`, `Flex`, etc.)
- **Theming**: Easily override default values or set up custom color schemes.
- **PostCSS Support**: Integrate with Tailwind, emotion, or plain CSS as needed.[^6]

---

## 📝 Example Usage

Here's a simple Mantine Button:

```

import { Button } from '@mantine/core';

function Demo() {
return <Button variant="filled" size="lg">Click Me</Button>;
}

```

For **more advanced demos** and real UI patterns, visit https://ui.mantine.dev.

---

## 💡 Tips for Effective Use

- **Premade Layout Patterns:** Clone complex dashboards or landing pages directly from Mantine UI, then customize.
- **Granular Theming:** Update global or per-component variables through MantineProvider.
- **Dark Mode:** Enabled out-of-the-box; use `colorScheme` prop or custom hooks to toggle.
- **Accessibility:** All components are accessible by default.

---

## 📚 Learn More

- [Mantine Core Documentation](https://mantine.dev/core/)
- [Mantine UI Patterns Gallery](https://ui.mantine.dev)
- [Full CSS Import Reference](https://mantine.dev/styles/css-files-list/)[^10]
- [Community & Help](https://help.mantine.dev/)

---

_Mantine UI is actively developed, well-documented, and designed for real-world production use. Whether you need a full dashboard, a landing page, or just gorgeous interactive widgets, Mantine UI makes it fast and easy._[^1][^7][^4][^10][^19]
```

<div style="text-align: center">⁂</div>

[^1]: https://ui.mantine.dev

[^2]: https://mantine.dev/getting-started/

[^3]: https://www.youtube.com/watch?v=EMoKmShoM_U

[^4]: https://refine.dev/blog/mantine-ui-react/

[^5]: https://www.youtube.com/watch?v=OqZHLVFP6g8

[^6]: https://mantine.dev/guides/redwood/

[^7]: https://www.reddit.com/r/UXDesign/comments/16mpj0y/as_a_ui_designer_how_do_i_use_the_mantine_ui/

[^8]: https://www.dhiwise.com/post/how-to-set-up-mantine-react-in-your-project-quickly

[^9]: https://mantine.dev/styles/css-files-list/

[^10]: https://mantine.dev/hooks/use-document-title/

[^11]: https://v5.mantine.dev/pages/basics/

[^12]: https://trends.builtwith.com/websitelist/Mantine

[^13]: https://help.mantine.dev

[^14]: https://mantine.dev/core/list/

[^15]: https://dev.to/sakethkowtha/about-mantine-ui-45g1

[^16]: https://mantine.dev/core/package/

[^17]: https://v4.mantine.dev/pages/basics/

[^18]: https://mantine.dev

[^19]: https://github.com/xiaohanyu/awesome-mantine

[^20]: https://www.figma.com/community/file/1067173247578645134/mantine-ui-component-library

========================
CODE SNIPPETS
========================
TITLE: MantineProvider Setup
DESCRIPTION: Wrap your application with MantineProvider to enable theming and access Mantine's context. You can define a custom theme or use the default.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_1

LANGUAGE: typescript
CODE:
```
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  /** Put your mantine theme override here */
});

function Demo() {
  return (
    <MantineProvider theme={theme}>
      {/* Your app here */}
    </MantineProvider>
  );
}
```

----------------------------------------

TITLE: Mantine Project Setup and Execution
DESCRIPTION: This snippet shows the initial setup and common commands for running Mantine locally. It includes installing dependencies, building packages, and starting development servers for Storybook and documentation.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/contribute.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
nvm use
yarn
npm run setup
npm run build all
npm run storybook
npm run docs
```

----------------------------------------

TITLE: Mantine Sponsor Button Example
DESCRIPTION: A React component example demonstrating how to render a Mantine Button configured as a link to sponsor the Mantine project, including custom styling and an icon.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_5

LANGUAGE: jsx
CODE:
```
<Button
  rightSection={<IconHeartFilled size={22} color="var(--mantine-color-red-7)" />}
  size="lg"
  miw={300}
  justify="space-between"
  children="Sponsor Mantine"
  variant="default"
  radius="md"
  component="a"
  href="https://opencollective.com/mantinedev"
/>
```

----------------------------------------

TITLE: Mantine Local Development Setup and Commands
DESCRIPTION: Provides essential shell commands for setting up and running the Mantine project locally. This includes installing dependencies, setting up the project environment, building packages, and starting development servers like Storybook and documentation.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/how-can-i-contribute.mdx#_snippet_1

LANGUAGE: shell
CODE:
```
nvm use
yarn
npm run setup
npm run build all
npm run storybook
npm run docs
npm run docs:docgen
```

----------------------------------------

TITLE: Install Dependencies and Start Development Server
DESCRIPTION: Commands to install project dependencies using Yarn and start the development server. These commands are essential after cloning a template or downloading a ZIP archive.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/templates-usage.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
yarn
yarn dev
```

----------------------------------------

TITLE: Start Storybook
DESCRIPTION: Command to run the Storybook development server after all configurations are complete.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/storybook.mdx#_snippet_5

LANGUAGE: bash
CODE:
```
npm run storybook
```

----------------------------------------

TITLE: Start Development Server
DESCRIPTION: Command to start the Vite development server after setup is complete.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/vite.mdx#_snippet_4

LANGUAGE: bash
CODE:
```
npm run dev
```

----------------------------------------

TITLE: CodeHighlight: Setup with highlight.js Adapter
DESCRIPTION: Shows how to integrate highlight.js with Mantine's CodeHighlight component in v8 using `CodeHighlightAdapterProvider` and `createHighlightJsAdapter`.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/7x-to-8x.mdx#_snippet_7

LANGUAGE: tsx
CODE:
```
import { MantineProvider } from '@mantine/core';
import { CodeHighlightAdapterProvider, createHighlightJsAdapter } from '@mantine/code-highlight';
import hljs from 'highlight.js/lib/core';
import tsLang from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', tsLang);

const highlightJsAdapter = createHighlightJsAdapter(hljs);

function App() {
  return (
    <MantineProvider>
      <CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
        {/* Your app here */}
      </CodeHighlightAdapterProvider>
    </MantineProvider>
  );
}
```

----------------------------------------

TITLE: Mantine Sponsor Button Example
DESCRIPTION: Demonstrates how to render a Mantine Button component configured as a link to the Mantine OpenCollective sponsorship page. It includes custom styling with an icon and specific dimensions.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_7

LANGUAGE: JSX
CODE:
```
<Button
  rightSection={<IconHeartFilled size={22} color=\"var(--mantine-color-red-7)\" />}
  size=\"lg"
  miw={300}
  justify=\"space-between"
  children=\"Sponsor Mantine"
  variant=\"default"
  radius=\"md"
  component=\"a"
  href=\"https://opencollective.com/mantinedev"
/>
```

----------------------------------------

TITLE: PostCSS Configuration for Mantine
DESCRIPTION: Configure PostCSS with necessary plugins like 'postcss-preset-mantine' and 'postcss-simple-vars' for Mantine's styling system. This setup is crucial for custom variable usage and preset configurations.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_3

LANGUAGE: javascript
CODE:
```
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

----------------------------------------

TITLE: Initialize Storybook Project
DESCRIPTION: Command to add Storybook to an existing application. This is the first step if Storybook is not already installed.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/storybook.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npx storybook@latest init
```

----------------------------------------

TITLE: Start RedwoodJS Development Server
DESCRIPTION: Command to start the development server for a RedwoodJS application after installation and setup.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/redwood.mdx#_snippet_3

LANGUAGE: bash
CODE:
```
yarn rw dev
```

----------------------------------------

TITLE: Mantine Project Setup and Layout
DESCRIPTION: This snippet demonstrates the basic import and export structure for a Mantine project page, likely for rendering content within a layout component. It imports necessary components and data structures.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/support.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.Support);
```

----------------------------------------

TITLE: Mantine Core Styles Import
DESCRIPTION: Import the core styles for Mantine components. This is a mandatory step for all Mantine packages to ensure proper styling.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import '@mantine/core/styles.css';
```

----------------------------------------

TITLE: Import All Mantine Core Styles
DESCRIPTION: Import all styles for the `@mantine/core` package to include all component styles in your application. This is the simplest way to get started with Mantine's styling.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/styles/mantine-styles.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import '@mantine/core/styles.css';
```

----------------------------------------

TITLE: Mantine Mark Component Setup and Usage
DESCRIPTION: This snippet shows how to import necessary modules, set up the layout, and render the Mark component with demo data. It highlights the integration of Mantine's layout system and demo components.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/mark.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { MarkDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.Mark);

## Usage

<Demo data={MarkDemos.usage} />
```

----------------------------------------

TITLE: Install @mantine/nprogress
DESCRIPTION: Instructions for installing the Mantine Navigation Progress package. This package requires @mantine/core and @mantine/hooks to be installed as well.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/nprogress/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
yarn add @mantine/nprogress @mantine/core @mantine/hooks
```

LANGUAGE: bash
CODE:
```
npm install @mantine/nprogress @mantine/core @mantine/hooks
```

----------------------------------------

TITLE: Install Mantine TipTap Packages
DESCRIPTION: Instructions for installing the necessary packages for Mantine's TipTap integration using yarn.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/x/tiptap.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
yarn add @mantine/tiptap @mantine/core @mantine/hooks @tiptap/react @tiptap/pm @tiptap/extension-link @tiptap/starter-kit
```

----------------------------------------

TITLE: Setup DirectionProvider
DESCRIPTION: Example of how to wrap your application with DirectionProvider and MantineProvider for RTL support.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/styles/rtl.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
import { DirectionProvider, MantineProvider } from '@mantine/core';

function Demo() {
  return (
    <DirectionProvider>
      <MantineProvider>{/* Your app here */}</MantineProvider>
    </DirectionProvider>
  );
}
```

----------------------------------------

TITLE: Install Placeholder Extension
DESCRIPTION: Instructions for installing the @tiptap/extension-placeholder package to enable placeholder functionality.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/x/tiptap.mdx#_snippet_3

LANGUAGE: bash
CODE:
```
yarn add @tiptap/extension-placeholder
```

----------------------------------------

TITLE: Install Shiki for CodeHighlight
DESCRIPTION: Installs the shiki package using yarn, which is required for advanced code highlighting with the CodeHighlight component. Shiki provides advanced syntax highlighting for TypeScript and CSS/Sass using textmate grammars.

SOURCE: https://github.com/mantinedev/mantine/blob/master/changelog/8.0.0.md#_snippet_11

LANGUAGE: bash
CODE:
```
yarn add shiki
```

----------------------------------------

TITLE: ColorSchemeScript for SSR
DESCRIPTION: Include ColorSchemeScript in your HTML head for server-side rendering (SSR) to manage color schemes correctly. This component handles the initial color scheme detection and application.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_2

LANGUAGE: typescript
CODE:
```
import { ColorSchemeScript } from '@mantine/core';

function Demo() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>My awesome app</title>

        <ColorSchemeScript />
      </head>
      <body>{/* Your app here */}</body>
    </html>
  );
}
```

----------------------------------------

TITLE: Mantine AspectRatio Component Setup
DESCRIPTION: Imports necessary components and data for the AspectRatio documentation page, and exports the layout component configured for AspectRatio content. This sets up the basic structure for displaying AspectRatio examples and related information.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/aspect-ratio.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { AspectRatioDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.AspectRatio);
```

----------------------------------------

TITLE: Basic MantineProvider Setup
DESCRIPTION: Demonstrates the fundamental usage of MantineProvider by wrapping the application. It shows how to import and use the component, typically with a custom theme object.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/theming/mantine-provider.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  /** Your theme override here */
});

function Demo() {
  return (
    <MantineProvider theme={theme}>
      {/* Your app here */}
    </MantineProvider>
  );
}
```

----------------------------------------

TITLE: Mantine Form Setup
DESCRIPTION: Basic setup for a Mantine page, importing necessary components and data, and exporting a default layout component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/form/recipes.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import { FormDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.formRecipes);
```

----------------------------------------

TITLE: Start Development Server
DESCRIPTION: Command to start the Gatsby development server after setting up Mantine.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/gatsby.mdx#_snippet_4

LANGUAGE: bash
CODE:
```
npm run develop
```

----------------------------------------

TITLE: Start Development Server
DESCRIPTION: Command to start the Gatsby development server after setting up Mantine integration.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/gatsby.mdx#_snippet_6

LANGUAGE: bash
CODE:
```
npm run develop
# or
yarn develop
```

----------------------------------------

TITLE: Start Development Server
DESCRIPTION: Starts the local development server for the project. The exact command may vary depending on the specific framework configuration of the Mantine template.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/templates-usage.mdx#_snippet_2

LANGUAGE: shell
CODE:
```
yarn dev
```

LANGUAGE: shell
CODE:
```
yarn start
```

----------------------------------------

TITLE: useTimeout Hook Usage Example
DESCRIPTION: Demonstrates a typical usage scenario for the `useTimeout` hook, showing how to import and utilize its returned `start` and `clear` functions.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/hooks/use-timeout.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
import { useTimeout } from '@mantine/hooks';

const { start, clear } = useTimeout(callback, delay, {
  autoInvoke: true,
});
```

----------------------------------------

TITLE: Start Development Server
DESCRIPTION: Command to start the local development server for a Next.js application. This command is used after setting up the project and dependencies.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/next.mdx#_snippet_7

LANGUAGE: bash
CODE:
```
npm run dev
```

----------------------------------------

TITLE: CodeHighlight: highlight.js CSS Import
DESCRIPTION: Illustrates how to add highlight.js CSS themes to your application for use with the CodeHighlight component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/7x-to-8x.mdx#_snippet_8

LANGUAGE: html
CODE:
```
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
/>
```

----------------------------------------

TITLE: Install @mantinex/mantine-header
DESCRIPTION: Instructions for installing the @mantinex/mantine-header package using yarn or npm.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantinex/mantine-header/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantinex/mantine-header

# With npm
npm install @mantinex/mantine-header
```

----------------------------------------

TITLE: Install Mantine Core
DESCRIPTION: Command to install the `@mantine/core` package along with `@mantine/hooks`.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/package.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install @mantine/hooks @mantine/core
# or
yarn add @mantine/hooks @mantine/core
```

----------------------------------------

TITLE: Install @mantinex/demo with Yarn or npm
DESCRIPTION: Instructions for installing the @mantinex/demo package using either Yarn or npm package managers. This package provides demo base components for Mantine.dev websites.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantinex/demo/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantinex/demo

# With npm
npm install @mantinex/demo
```

----------------------------------------

TITLE: Mantine Component Setup with Icons
DESCRIPTION: Demonstrates the basic setup for a Mantine component that utilizes icon libraries. It includes imports for layout and demo data, and exports a default layout component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/icons.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import { GuidesDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.Icons);
```

----------------------------------------

TITLE: Install Mantine Spotlight
DESCRIPTION: Instructions for installing the Mantine Spotlight package and its core dependencies using either yarn or npm.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/spotlight/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/spotlight @mantine/core @mantine/hooks
```

LANGUAGE: bash
CODE:
```
# With npm
npm install @mantine/spotlight @mantine/core @mantine/hooks
```

----------------------------------------

TITLE: VS Code CSS Variable Autocomplete Configuration
DESCRIPTION: Configures VS Code to recognize CSS variables across various stylesheet types, including SCSS, SASS, and LESS, and specifically points to Mantine's core styles for better autocompletion.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_4

LANGUAGE: json
CODE:
```
{
  "cssVariables.lookupFiles": [
    "**/*.css",
    "**/*.scss",
    "**/*.sass",
    "**/*.less",
    "node_modules/@mantine/core/styles.css"
  ]
}
```

----------------------------------------

TITLE: Responsive Styles CSS Output Example
DESCRIPTION: Provides an example of the generated CSS for responsive style props. It shows how base styles are applied and then overridden by media queries corresponding to defined breakpoints.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/styles/style-props.mdx#_snippet_4

LANGUAGE: css
CODE:
```
/* Base styles added to element and then get overwritten with responsive values */
.element {
  width: 20rem;
}

/* 48em is theme.breakpoints.sm by default */
@media (min-width: 48em) {
  .element {
    width: 30rem;
  }
}

/* 75em is theme.breakpoints.lg by default */
@media (min-width: 75em) {
  .element {
    width: 40rem;
  }
}
```

----------------------------------------

TITLE: Install Underline Extension
DESCRIPTION: Instructions for installing the @tiptap/extension-underline package to enable underline functionality.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/x/tiptap.mdx#_snippet_4

LANGUAGE: bash
CODE:
```
yarn add @tiptap/extension-underline
```

----------------------------------------

TITLE: Get Stepper and Step Refs
DESCRIPTION: Example of how to obtain references to the Stepper root element and individual Stepper.Step components using `useRef`.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/stepper.mdx#_snippet_8

LANGUAGE: tsx
CODE:
```
## Get step ref

You can get refs of step button and stepper root element (div):

```tsx
import { useRef } from 'react';
import { Stepper } from '@mantine/core';

function MyStepper() {
  const firstStep = useRef<HTMLButtonElement>(null);
  const stepper = useRef<HTMLDivElement>(null);

  return (
    <Stepper ref={stepper} active={0}>
      <Stepper.Step label="First step" ref={firstStep} />
      <Stepper.Step label="Second step" />
    </Stepper>
  );
}
```
```

----------------------------------------

TITLE: Install Mantine Charts and Recharts
DESCRIPTION: Installs the Mantine Charts package and the Recharts library using a package manager. This is the first step to integrate charting capabilities into your Mantine application.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/charts/getting-started.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npm install @mantine/charts recharts
# or
yarn add @mantine/charts recharts
# or
pnpm add @mantine/charts recharts
```

----------------------------------------

TITLE: Mantine Stack Component Setup
DESCRIPTION: This code snippet demonstrates the basic setup for the Mantine Stack component page. It imports necessary components and data, and defines the default layout for the page.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/stack.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { StackDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.Stack);
```

----------------------------------------

TITLE: Example Usage: Stepper Component
DESCRIPTION: Demonstrates the usage of the Stepper component from the @mantine/core package, showing how to integrate demo data and configure its display.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/package.mdx#_snippet_3

LANGUAGE: javascript
CODE:
```
<Demo data={StepperDemos.usage} demoProps={{ defaultExpanded: false }} />
```

----------------------------------------

TITLE: Install Stylelint and SCSS Config
DESCRIPTION: Installs the necessary Stylelint packages for linting CSS and SCSS files. This includes the core Stylelint package and a standard SCSS configuration.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/how-to-setup-stylelint.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npm install stylelint stylelint-config-standard-scss --save-dev
```

----------------------------------------

TITLE: Configure highlight.js Adapter for CodeHighlight
DESCRIPTION: Details the setup for using the highlight.js adapter with Mantine's CodeHighlight component. This includes installing 'highlight.js', registering languages, creating the adapter, and applying highlight.js CSS themes.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/x/code-highlight.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { MantineProvider } from '@mantine/core';
import { CodeHighlightAdapterProvider, createHighlightJsAdapter } from '@mantine/code-highlight';
import hljs from 'highlight.js/lib/core';
import tsLang from 'highlight.js/lib/languages/typescript';

hls.registerLanguage('typescript', tsLang);

const highlightJsAdapter = createHighlightJsAdapter(hljs);

function App() {
  return (
    <MantineProvider>
      <CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
        {/* Your app here */}
      </CodeHighlightAdapterProvider>
    </MantineProvider>
  );
}
```

----------------------------------------

TITLE: Install Shiki Package
DESCRIPTION: Installs the 'shiki' package, which is required for using the Shiki adapter with the CodeHighlight component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/changelog/8-0-0.mdx#_snippet_4

LANGUAGE: bash
CODE:
```
npm install shiki
# or
yarn add shiki
# or
pnpm add shiki
```

----------------------------------------

TITLE: Mantine Kbd Size Example
DESCRIPTION: Illustrates different size variants available for the Mantine Kbd component. This example shows how to apply various sizes.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/kbd.mdx#_snippet_3

LANGUAGE: jsx
CODE:
```
<Demo data={KbdDemos.size} />
```

----------------------------------------

TITLE: Mantine CodeHighlight Package Refactor
DESCRIPTION: Explains the refactoring of the @mantine/code-highlight package, removing its dependency on highlight.js and introducing an adapter-based API. It mentions out-of-the-box adapters for shiki and highlight.js and directs users to migration guides.

SOURCE: https://github.com/mantinedev/mantine/blob/master/changelog/8.0.0.md#_snippet_10

LANGUAGE: APIDOC
CODE:
```
Mantine CodeHighlight Package Update:

- **Dependency Change**: Removed direct dependency on highlight.js.
- **New API**: Introduces an adapter-based API for syntax highlighting.
- **Supported Adapters**: Includes adapters for 'shiki' and 'highlight.js' out-of-the-box.
- **Migration**: Refer to the updated CodeHighlight documentation and the 7.x -> 8.x migration guide for details on adapting existing implementations.

Example of using adapters (conceptual):

```javascript
import { CodeHighlight } from '@mantine/code-highlight';
import { shiki } from '@mantine/code-highlight/shiki';

// Initialize highlighter with an adapter
CodeHighlight.initHighlighter(shiki);

// Use CodeHighlight component
<CodeHighlight code="console.log('Hello');" language="javascript" />
```
```

----------------------------------------

TITLE: Use sx and styles props with @mantine/emotion
DESCRIPTION: Shows that `sx` and `styles` props remain functional in `@mantine/emotion` v7.x, similar to v6.x, after proper setup.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/6x-to-7x.mdx#_snippet_1

LANGUAGE: tsx
CODE:
```
// 6.x and 7.x, no changes
import { Box, Button } from '@mantine/core';

function Demo() {
  return (
    <>
      <Box
        sx={(theme) => ({ backgroundColor: theme.colors.red[5] })}
      />
      <Button styles={{ root: { height: 50 } }} />
    </>
  );
}
```

----------------------------------------

TITLE: Mantine Kbd Usage Example
DESCRIPTION: Demonstrates the basic usage of the Mantine Kbd component. It renders a demo showcasing the default appearance and functionality.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/kbd.mdx#_snippet_2

LANGUAGE: jsx
CODE:
```
<Demo data={KbdDemos.usage} />
```

----------------------------------------

TITLE: VS Code CSS Variable Autocomplete Configuration
DESCRIPTION: Configures VS Code to recognize CSS variable definitions across various file types and within the Mantine core styles. This enables autocompletion and helps prevent syntax errors when using CSS variables.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/getting-started.mdx#_snippet_6

LANGUAGE: JSON
CODE:
```
{
  "cssVariables.lookupFiles": [
    "**/*.css",
    "**/*.scss",
    "**/*.sass",
    "**/*.less",
    "node_modules/@mantine/core/styles.css"
  ]
}
```

----------------------------------------

TITLE: NavLink Component Setup
DESCRIPTION: Imports necessary components and data for the NavLink documentation page, and sets up the default layout.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/nav-link.mdx#_snippet_0

LANGUAGE: javascript
CODE:
```
import { NavLinkDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.NavLink);
```

----------------------------------------

TITLE: Configure Storybook Addons for Mantine
DESCRIPTION: Instructions for adding essential Storybook addons for Mantine integration, including storybook-dark-mode and @storybook/addon-styling-webpack (conditional for Vite users). This involves installing packages and updating the Storybook configuration file.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/storybook.mdx#_snippet_1

LANGUAGE: typescript
CODE:
```
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ... other config properties
  addons: [
    // ... other addons
    '@storybook/addon-styling-webpack', // Add this line only if you are not using Vite
    'storybook-dark-mode',
  ],
};

export default config;
```

----------------------------------------

TITLE: Mantine `styles` prop: Regular Selectors (6.x & 7.x)
DESCRIPTION: Regular selectors within the `styles` prop continue to be supported in both Mantine v6.x and v7.x. This example demonstrates a simple style application that remains compatible across versions.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/6x-to-7x.mdx#_snippet_6

LANGUAGE: tsx
CODE:
```
// Works both in 6.x and 7.x
import { TextInput } from '@mantine/core';

function Demo() {
  return (
    <TextInput
      styles={{
        input: {
          color: 'red',
        },
      }}
    />
  );
}
```

----------------------------------------

TITLE: Theme Override Example
DESCRIPTION: Illustrates how to customize the application's theme by passing a `createTheme` object to the `theme` prop of MantineProvider.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/theming/mantine-provider.mdx#_snippet_2

LANGUAGE: tsx
CODE:
```
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});

function Demo() {
  return (
    <MantineProvider theme={theme}>
      {/* Your app here */}
    </MantineProvider>
  );
}
```

----------------------------------------

TITLE: Install Mantine Vanilla Extract
DESCRIPTION: Instructions for installing the @mantine/vanilla-extract package using either yarn or npm package managers.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/vanilla-extract/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/vanilla-extract

# With npm
npm install @mantine/vanilla-extract
```

----------------------------------------

TITLE: CSS Layers Override Example
DESCRIPTION: Shows how regular styles (not wrapped in a layer) will be applied after Mantine's layered styles, effectively overriding them even if Mantine's layered CSS is imported first.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/styles/mantine-styles.mdx#_snippet_6

LANGUAGE: tsx
CODE:
```
// ✅ If your styles are not wrapped in @layer directive,
// they will be applied after Mantine styles
import classes from './Demo.module.css';

import '@mantine/core/styles.layer.css';
```

----------------------------------------

TITLE: useFocusReturn Hook Usage Example
DESCRIPTION: Demonstrates the basic usage of the useFocusReturn hook, showing how to activate it by passing the 'opened' prop. This example illustrates how focus is managed when the hook's condition is met.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/hooks/use-focus-return.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { useFocusReturn } from '@mantine/hooks';

useFocusReturn({
  // Is region with focus trap active?
  // When it activates hook saves document.activeElement to the internal state
  // and focuses this element once focus trap is deactivated
  opened: false,

  // Determines whether focus should be returned automatically, true by default
  shouldReturnFocus: true,
});
```

----------------------------------------

TITLE: Mantine responsive guide updates
DESCRIPTION: The responsive guide has been updated to include information on `mantine-hidden-from-{x}` and `mantine-visible-from-{x}` classes for controlling element visibility based on screen size.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/changelog/7-7-0.mdx#_snippet_7

LANGUAGE: markdown
CODE:
```
- New section has been added to the [responsive guide](/styles/responsive#hidden-and-visible-from-as-classes) on how to use `mantine-hidden-from-{x}` and `mantine-visible-from-{x}` classes.
```

----------------------------------------

TITLE: Install PostCSS Plugins
DESCRIPTION: Installs necessary PostCSS plugins, including `postcss-preset-mantine` and `postcss-simple-vars`, which are required for Mantine's styling configuration.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/next.mdx#_snippet_6

LANGUAGE: bash
CODE:
```
npm install -D postcss postcss-preset-mantine postcss-simple-vars
yarn add -D postcss postcss-preset-mantine postcss-simple-vars
```

----------------------------------------

TITLE: Install @mantine/charts
DESCRIPTION: Provides installation instructions for the @mantine/charts package using both yarn and npm package managers.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/charts/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn\nyarn add @mantine/charts\n\n# With npm\n npm install @mantine/charts
```

----------------------------------------

TITLE: Mantine Container Component Setup
DESCRIPTION: This TypeScript snippet demonstrates the basic setup for a page using the Mantine Container component. It imports necessary components and data, and exports a layout function configured with MDX data for the Container component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/container.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { ContainerDemos } from '@docs/demos';
import { Layout } from '@/layout';
import { MDX_DATA } from '@/mdx';

export default Layout(MDX_DATA.Container);
```

----------------------------------------

TITLE: Install @mantine/emotion
DESCRIPTION: Installs the @mantine/emotion package using either Yarn or npm. This is the primary step to integrate Emotion bindings with Mantine.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/emotion/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/emotion

# With npm
npm install @mantine/emotion
```

----------------------------------------

TITLE: DatesProvider Localization (Next.js App Router)
DESCRIPTION: Example for setting locale in Next.js app router using DatesProvider. Requires the 'use client' directive at the top of the file to ensure locale data is available on both client and server.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/dates/getting-started.mdx#_snippet_4

LANGUAGE: tsx
CODE:
```
'use client';

import 'dayjs/locale/ru';

import { DatesProvider } from '@mantine/dates';

function Demo() {
  return (
    <DatesProvider settings={{ locale: 'ru' }}>
      {/* Your app  */}
    </DatesProvider>
  );
}
```

----------------------------------------

TITLE: ColorSwatch Usage Example
DESCRIPTION: Demonstrates the basic usage of the ColorSwatch component. It shows how to render the component with its default properties.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/color-swatch.mdx#_snippet_0

LANGUAGE: jsx
CODE:
```
import { ColorSwatch } from '@mantine/core';

function Demo() {
  return <ColorSwatch color="#FF0000" />;
}
```

----------------------------------------

TITLE: useOrientation Hook Example
DESCRIPTION: Provides an example of the `useOrientation` hook from `@mantine/hooks` to get information about the device's screen orientation, including angle and type.

SOURCE: https://github.com/mantinedev/mantine/blob/master/changelog/7.8.0.md#_snippet_13

LANGUAGE: tsx
CODE:
```
import { Code, Text } from '@mantine/core';
import { useOrientation } from '@mantine/hooks';

function Demo() {
  const { angle, type } = useOrientation();
  return (
    <>
      <Text>
        Angle: <Code>{angle}</Code>
      </Text>
      <Text>
        Type: <Code>{type}</Code>
      </Text>
    </>
  );
}
```

----------------------------------------

TITLE: Update Embla Carousel Dependencies
DESCRIPTION: Starting from Mantine Carousel 8.x, you must update embla-carousel and embla-carousel-react to version 8.x. This ensures compatibility with the new carousel features and API.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/7x-to-8x.mdx#_snippet_11

LANGUAGE: bash
CODE:
```
npm install embla-carousel@^8.5.2 embla-carousel-react@^8.5.2
```

----------------------------------------

TITLE: Next.js App Router Tree Shaking Configuration
DESCRIPTION: Configuration snippet for `next.config.mjs` to enable experimental `optimizePackageImports` for Mantine components, facilitating tree shaking in the Next.js app router. This helps reduce bundle size by importing only necessary modules.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/next.mdx#_snippet_12

LANGUAGE: javascript
CODE:
```
export default {
  // ...other configuration
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
};
```

----------------------------------------

TITLE: useModalsStack Hook Usage Example
DESCRIPTION: Illustrates a basic implementation of the useModalsStack hook with two simple Modal components, showing how to register and open modals by their unique IDs.

SOURCE: https://github.com/mantinedev/mantine/blob/master/changelog/7.14.0.md#_snippet_5

LANGUAGE: tsx
CODE:
```
import { Modal, useModalsStack } from '@mantine/core';

function Demo() {
  const stack = useModalsStack(['first', 'second']);

  return (
    <>
      <Modal {...stack.register('first')}>First</Modal>
      <Modal {...stack.register('second')}>Second</Modal>
      <Button onClick={() => stack.open('first')}>Open first</Button>
    </>
  );
}
```

----------------------------------------

TITLE: Vitest Setup File
DESCRIPTION: Sets up the Vitest environment by importing testing library extensions and mocking browser APIs like `getComputedStyle`, `scrollIntoView`, `matchMedia`, and `ResizeObserver`. These mocks are crucial for components that rely on these APIs, which are not natively available in the jsdom environment.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/vitest.mdx#_snippet_2

LANGUAGE: mjs
CODE:
```
import '@testing-library/jest-dom/vitest';

import {
  vi
} from 'vitest';

const {
  getComputedStyle
} = window;
window.getComputedStyle = (elt) => getComputedStyle(elt);
window.HTMLElement.prototype.scrollIntoView = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;
```

----------------------------------------

TITLE: Install Mantine Code Highlight
DESCRIPTION: Provides installation commands for Mantine Code Highlight using yarn and npm. Requires @mantine/hooks, @mantine/core, and @mantine/code-highlight packages.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/code-highlight/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/hooks @mantine/core @mantine/code-highlight

# With npm
npm install @mantine/hooks @mantine/core @mantine/code-highlight
```

----------------------------------------

TITLE: Progress Component Usage Example
DESCRIPTION: Demonstrates the basic usage of the Mantine Progress component with a specified value.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/progress.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { Progress } from '@mantine/core';

function Demo() {
  return <Progress value={10} />;
}
```

----------------------------------------

TITLE: Custom Color Scheme Manager Example
DESCRIPTION: Shows how to implement a custom color scheme manager, for example, using `localStorageColorSchemeManager` with a specific storage key.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/theming/mantine-provider.mdx#_snippet_3

LANGUAGE: tsx
CODE:
```
import {
  localStorageColorSchemeManager,
  MantineProvider,
} from '@mantine/core';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'my-app-color-scheme',
});

function Demo() {
  return (
    <MantineProvider colorSchemeManager={colorSchemeManager}>
      {/* Your app here */}
    </MantineProvider>
  );
}
```

----------------------------------------

TITLE: Install @mantinex/mantine-logo
DESCRIPTION: Installs the @mantinex/mantine-logo package using package managers like Yarn or NPM. Ensure you have Node.js and a package manager installed.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantinex/mantine-logo/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
yarn add @mantinex/mantine-logo
```

LANGUAGE: bash
CODE:
```
npm install @mantinex/mantine-logo
```

----------------------------------------

TITLE: Blockquote Usage Example
DESCRIPTION: Renders the Blockquote component using demo data, typically within a documentation or example page structure.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/blockquote.mdx#_snippet_1

LANGUAGE: jsx
CODE:
```
<Demo data={BlockquoteDemos.usage} />
```

----------------------------------------

TITLE: Custom Variants Type Augmentation Guide
DESCRIPTION: Provides a guide on augmenting component variant types, illustrated with an example for the `Button` component. This allows developers to extend existing variants or add new ones like 'contrast' or 'radial-gradient'.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/changelog/7-15-0.mdx#_snippet_12

LANGUAGE: typescript
CODE:
```
import { ButtonVariant, MantineSize } from '@mantine/core';

type ExtendedButtonVariant = ButtonVariant | 'contrast' | 'radial-gradient';

declare module '@mantine/core' {
  export interface ButtonProps {
    variant?: ExtendedButtonVariant;
  }
}
```

----------------------------------------

TITLE: Install Mantine Notifications
DESCRIPTION: Instructions to install the Mantine notifications system and its dependencies using either yarn or npm package managers.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/notifications/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/hooks @mantine/core @mantine/notifications

# With npm
npm install @mantine/hooks @mantine/core @mantine/notifications
```

----------------------------------------

TITLE: NavLink Usage Example
DESCRIPTION: Demonstrates the basic usage of the NavLink component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/nav-link.mdx#_snippet_1

LANGUAGE: jsx
CODE:
```
<Demo data={NavLinkDemos.usage} />
```

----------------------------------------

TITLE: Mantine Jest/Vitest guides updates
DESCRIPTION: Configuration for Jest and Vitest guides has been updated to include necessary mocks for `window.HTMLElement.prototype.scrollIntoView`, ensuring better test reliability.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/changelog/7-7-0.mdx#_snippet_8

LANGUAGE: markdown
CODE:
```
- [Jest](/guides/jest) and [Vitest](/guides/vitest) guides configuration has been updated to include mocks for `window.HTMLElement.prototype.scrollIntoView`
```

----------------------------------------

TITLE: Install Spotlight Package Styles
DESCRIPTION: Import the core styles and then the spotlight-specific styles at the root of your application to ensure correct styling for the Spotlight component.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/x/spotlight.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import '@mantine/core/styles.css';
// ‼️ import spotlight styles after core package styles
import '@mantine/spotlight/styles.css';
```

----------------------------------------

TITLE: Mantine RadialBarChart Component Example
DESCRIPTION: Illustrates the use of the Mantine RadialBarChart component for data visualization. The example shows how to pass data and configure the chart with labels.

SOURCE: https://github.com/mantinedev/mantine/blob/master/changelog/7.14.0.md#_snippet_1

LANGUAGE: tsx
CODE:
```
import { RadialBarChart } from '@mantine/charts';

const data = [
  { name: '18-24', value: 31.47, color: 'blue.7' },
  { name: '25-29', value: 26.69, color: 'orange.6' },
  { name: '30-34', value: 15.69, color: 'yellow.7' },
  { name: '35-39', value: 8.22, color: 'cyan.6' },
  { name: '40-49', value: 8.63, color: 'green' },
  { name: '50+', value: 2.63, color: 'pink' },
  { name: 'unknown', value: 6.67, color: 'gray' },
];

function Demo() {
  return <RadialBarChart data={data} dataKey="value" h={280} withLabels />;
}
```

----------------------------------------

TITLE: Install Mantine Package
DESCRIPTION: Instructions for installing the Mantine package using either yarn or npm. These commands are essential for adding the library to your project's dependencies.

SOURCE: https://github.com/mantinedev/mantine/blob/master/scripts/plop/templates/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add {{package}}

# With npm
npm install {{package}}
```

----------------------------------------

TITLE: Install Vitest and React Testing Library
DESCRIPTION: Installs necessary packages for Vitest and React Testing Library, including jsdom and testing utilities. This command is intended for use with npm or yarn.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/vitest.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npm install -D vitest jsdom @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

----------------------------------------

TITLE: Install PostCSS and Mantine Packages
DESCRIPTION: Installs the necessary PostCSS plugins and Mantine packages required for styling. The `--save-dev` flag is implied by the `dev` attribute.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/vite.mdx#_snippet_1

LANGUAGE: bash
CODE:
```
npm install -D postcss postcss-preset-mantine postcss-simple-vars
```

----------------------------------------

TITLE: Install @mantine/vanilla-extract
DESCRIPTION: Install the Mantine package for Vanilla Extract integration. This package provides utilities to convert Mantine themes into CSS variables.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/styles/vanilla-extract.mdx#_snippet_0

LANGUAGE: bash
CODE:
```
npm install @mantine/vanilla-extract
# or
yarn add @mantine/vanilla-extract
# or
pnpm add @mantine/vanilla-extract
```

----------------------------------------

TITLE: Jest Configuration Setup (JS)
DESCRIPTION: Configures Jest to use the custom setup file for mocking browser APIs. The `setupFilesAfterEnv` option points to the `jest.setup.js` file, ensuring these mocks are applied before tests run.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/guides/jest.mdx#_snippet_4

LANGUAGE: js
CODE:
```
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // ... rest of your config
};

export default config;
```

----------------------------------------

TITLE: ColorPicker Basic Usage Example
DESCRIPTION: Demonstrates the basic usage of the ColorPicker component. This snippet shows how to render the component in its default state.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/color-picker.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import { ColorPicker } from '@mantine/core';

function Demo() {
  return <ColorPicker />; 
}
```

----------------------------------------

TITLE: Mantine Flex Component Usage Example
DESCRIPTION: Demonstrates the basic usage of the Mantine Flex component with a configurator.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/core/flex.mdx#_snippet_1

LANGUAGE: jsx
CODE:
```
<Demo data={FlexDemos.configurator} />
```

----------------------------------------

TITLE: TransferList Component Removal and Combobox Alternative
DESCRIPTION: The TransferList component is no longer part of `@mantine/core`. It can be implemented using the Combobox component, with an example available.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/changelog/7-0-0.mdx#_snippet_35

LANGUAGE: APIDOC
CODE:
```
TransferList:
  - Removed from `@mantine/core`.
  - Alternative implementation using `Combobox` component is recommended.
  - See Combobox example for TransferList implementation.
```

----------------------------------------

TITLE: Install @mantinex/mantine-meta with Yarn or NPM
DESCRIPTION: This snippet shows how to install the @mantinex/mantine-meta package using either Yarn or NPM package managers. It is a common first step for integrating the meta data package into your project.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantinex/mantine-meta/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantinex/mantine-meta

# With npm
npm install @mantinex/mantine-meta
```

----------------------------------------

TITLE: Install @mantinex/dev-icons with Yarn
DESCRIPTION: Installs the @mantinex/dev-icons package using the Yarn package manager. This command adds the package as a dependency to your project.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantinex/dev-icons/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
yarn add @mantinex/dev-icons
```

----------------------------------------

TITLE: Install Mantine Dates Styles
DESCRIPTION: Imports core and dates styles for Mantine UI components. It's crucial to import dates styles after core styles to ensure correct rendering.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/dates/getting-started.mdx#_snippet_0

LANGUAGE: tsx
CODE:
```
import '@mantine/core/styles.css';
// ‼️ import dates styles after core package styles
import '@mantine/dates/styles.css';
```

----------------------------------------

TITLE: Install Mantine Carousel
DESCRIPTION: Install the Mantine carousel component along with core and hooks packages using either yarn or npm.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/carousel/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/core @mantine/hooks @mantine/carousel
```

LANGUAGE: bash
CODE:
```
# With npm
npm install @mantine/core @mantine/hooks @mantine/carousel
```

----------------------------------------

TITLE: Install Mantine Tiptap Dependencies
DESCRIPTION: Installs the required Mantine Tiptap packages and its core dependencies using either yarn or npm. This includes Mantine core, hooks, and necessary tiptap extensions for rich text editing.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/tiptap/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/core @mantine/hooks @tiptap/react @tiptap/extension-link

# With npm
npm install @mantine/core @mantine/hooks @tiptap/react @tiptap/extension-link
```

----------------------------------------

TITLE: Install @mantinex/dev-icons with NPM
DESCRIPTION: Installs the @mantinex/dev-icons package using the NPM package manager. This command adds the package as a dependency to your project.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantinex/dev-icons/README.md#_snippet_1

LANGUAGE: bash
CODE:
```
npm install @mantinex/dev-icons
```

----------------------------------------

TITLE: CSS Layer Ordering
DESCRIPTION: Defines the cascade order for different style layers. In this example, 'mantine' styles will take precedence over 'base' styles but will be overridden by 'components' styles.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/mantine.dev/src/pages/styles/mantine-styles.mdx#_snippet_7

LANGUAGE: scss
CODE:
```
@layer base, mantine, components;
```

----------------------------------------

TITLE: Mantine Menu Component with Submenus
DESCRIPTION: Example of using the Mantine Menu component to implement nested submenus. It showcases the structure for creating expandable menu items with their own dropdowns.

SOURCE: https://github.com/mantinedev/mantine/blob/master/changelog/8.0.0.md#_snippet_1

LANGUAGE: tsx
CODE:
```
import { Button, Menu } from '@mantine/core';

function Demo() {
  return (
    <Menu width={200} position="bottom-start">
      <Menu.Target>
        <Button>Toggle Menu</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item>Dashboard</Menu.Item>

        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item>Products</Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>
            <Menu.Item>All products</Menu.Item>
            <Menu.Item>Categories</Menu.Item>
            <Menu.Item>Tags</Menu.Item>
            <Menu.Item>Attributes</Menu.Item>
            <Menu.Item>Shipping classes</Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item>Orders</Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>
            <Menu.Item>Open</Menu.Item>
            <Menu.Item>Completed</Menu.Item>
            <Menu.Item>Cancelled</Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item>Settings</Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>
            <Menu.Item>Profile</Menu.Item>
            <Menu.Item>Security</Menu.Item>
            <Menu.Item>Notifications</Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>
      </Menu.Dropdown>
    </Menu>
  );
}
```

----------------------------------------

TITLE: Install @mantine/hooks
DESCRIPTION: Instructions for installing the @mantine/hooks package using either yarn or npm package managers.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/hooks/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/hooks
```

LANGUAGE: bash
CODE:
```
# With npm
npm install @mantine/hooks
```

----------------------------------------

TITLE: Project Setup and Metadata
DESCRIPTION: Defines project metadata including title, description, and category, and exports a layout component. This sets up the page's core information and structure.

SOURCE: https://github.com/mantinedev/mantine/blob/master/apps/help.mantine.dev/src/pages/q/select-autocomplete-difference.mdx#_snippet_0

LANGUAGE: typescript
CODE:
```
import { AutocompleteCity } from '@/demos/AutocompleteCity.demo';
import { SelectCountry } from '@/demos/SelectCountry.demo';
import { Layout } from '@/layout';

export const meta = {
  title:
    'What is the difference between searchable Select and Autocomplete?',
  description:
    'Searchable Select and Autocomplete are similar components, but they serve different purposes.',
  slug: 'select-autocomplete-difference',
  category: 'components',
  tags: ['select', 'autocomplete', 'searchable', 'combobox'],
  created_at: 'December 26, 2023',
  last_updated_at: 'December 26, 2023',
};

export default Layout(meta);
```

----------------------------------------

TITLE: Install Mantine Core
DESCRIPTION: Installs the Mantine core components library and Mantine hooks using either yarn or npm package managers.

SOURCE: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/core/README.md#_snippet_0

LANGUAGE: bash
CODE:
```
# With yarn
yarn add @mantine/core @mantine/hooks

# With npm
npm install @mantine/core @mantine/hooks
```