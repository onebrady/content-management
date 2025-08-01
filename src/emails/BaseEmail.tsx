import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
  Button,
} from '@react-email/components';

interface BaseEmailProps {
  previewText: string;
  title: string;
  heading: string;
  children: React.ReactNode;
  footerText?: string;
  footerLinks?: Array<{ text: string; href: string }>;
  buttonText?: string;
  buttonLink?: string;
}

export default function BaseEmail({
  previewText,
  title,
  heading,
  children,
  footerText = '© 2024 Content Management Tool. All rights reserved.',
  footerLinks = [
    { text: 'Terms', href: '#' },
    { text: 'Privacy', href: '#' },
    { text: 'Unsubscribe', href: '#' },
  ],
  buttonText,
  buttonLink,
}: BaseEmailProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto p-4 max-w-600">
            <Section className="bg-white p-6 rounded-lg shadow-sm">
              <Heading className="text-2xl font-bold text-gray-800 mb-4">
                {heading}
              </Heading>

              {children}

              {buttonText && buttonLink && (
                <Section className="my-6 text-center">
                  <Button
                    href={buttonLink}
                    className="bg-blue-600 text-white py-3 px-6 rounded-md font-medium"
                  >
                    {buttonText}
                  </Button>
                </Section>
              )}
            </Section>

            <Section className="mt-6 text-center text-gray-600 text-sm">
              <Text>{footerText}</Text>
              <Hr className="my-4 border-gray-300" />
              <Text>
                {footerLinks.map((link, index) => (
                  <React.Fragment key={index}>
                    <Link href={link.href} className="text-blue-600 underline">
                      {link.text}
                    </Link>
                    {index < footerLinks.length - 1 && ' • '}
                  </React.Fragment>
                ))}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
